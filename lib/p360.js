const p360 = require('@alheimsins/p360')
const { escape, unescape } = require('querystring')

async function getFiles (client, escapedDocumentNumber, recno) {
  const documentNumber = unescape(escapedDocumentNumber)
  const documentService = await client.DocumentService()
  const documentQuery = {
    parameter: {
      DocumentNumber: documentNumber,
      IncludeFileData: true
    }
  }

  const { result: { GetDocumentsResult } } = await documentService.GetDocuments(documentQuery)

  if (!GetDocumentsResult || !GetDocumentsResult.Successful) {
    throw Error('Unknown error - query failed')
  }

  const documents = GetDocumentsResult.Documents && GetDocumentsResult.Documents.DocumentResult ? GetDocumentsResult.Documents.DocumentResult : []
  const file = Array.isArray(documents.Files.DocumentFileResult)
    ? documents.Files.DocumentFileResult.find(file => file.Recno === parseInt(recno))
    : documents.Files.DocumentFileResult

  return { file: file.Base64Data }
}

async function getDocuments (client, fnr) {
  const caseService = await client.CaseService()
  const documentService = await client.DocumentService()

  // CaseService
  const caseQuery = {
    parameter: {
      Title: 'Elevmappe',
      ContactReferenceNumber: fnr
    }
  }
  const { result: { GetCasesResult } } = await caseService.GetCases(caseQuery)

  if (!GetCasesResult || !GetCasesResult.Successful) {
    throw Error('Unknown error - query failed')
  }

  const cases = GetCasesResult.Cases && GetCasesResult.Cases.CaseResult ? GetCasesResult.Cases.CaseResult : {}

  const { CaseNumber } = Array.isArray(cases)
    ? cases.find(caseItem => caseItem.Status === 'Under behandling')
    : cases

  if (!CaseNumber) {
    throw Error('Finner ikke elevmappe. Kontakt arkivet.')
  }

  // DocumentService
  const documentQuery = {
    parameter: {
      CaseNumber
    }
  }

  const { result: { GetDocumentsResult } } = await documentService.GetDocuments(documentQuery)

  if (!GetDocumentsResult || !GetDocumentsResult.Successful) {
    throw Error('Unknown error - query failed')
  }

  const documents = GetDocumentsResult.Documents && GetDocumentsResult.Documents.DocumentResult ? GetDocumentsResult.Documents.DocumentResult : []

  // Show only documents that has StatusCode J, E, or F
  const acceptedStatusCodes = ['J', 'E', 'F']
  const filterDocuments = documents.filter(item => acceptedStatusCodes.includes(item.StatusCode))

  const getContacts = (contacts, role) => {
    if (contacts && Array.isArray(contacts.DocumentContactResult)) {
      const { SearchName } = contacts.DocumentContactResult.find(contact => contact.Role === role) || {}
      return SearchName
    }
  }

  const repackFiles = (documentItem, files) => files.map(file => ({
    from: getContacts(documentItem.Contacts, 'Avsender') || '',
    to: getContacts(documentItem.Contacts, 'Mottaker') || '',
    date: new Date(documentItem.DocumentDate).toISOString().split('T')[0],
    category: file.CategoryDescription,
    title: file.Title,
    file: escape(documentItem.DocumentNumber),
    recno: file.Recno
  }))

  const repackedDocuments = filterDocuments.map(documentItem => ({
    id: escape(documentItem.DocumentNumber),
    title: documentItem.Title,
    sortId: documentItem.DocumentNumber.match(/\d/g).join(''),
    files: repackFiles(documentItem, Array.isArray(documentItem.Files.DocumentFileResult) ? documentItem.Files.DocumentFileResult : [documentItem.Files.DocumentFileResult])
  }))

  return { caseNumber: CaseNumber, documents: repackedDocuments }
}

module.exports = options => {
  const client = p360(options)
  return {
    getDocuments: (fnr) => getDocuments(client, fnr),
    getFiles: (documentId, recno) => getFiles(client, documentId, recno)
  }
}
