const p360 = require('@alheimsins/p360')
const { escape, unescape } = require('querystring')

async function getFiles (client, escapedDocumentNumber) {
  try {
    const documentNumber = unescape(escapedDocumentNumber)
    const documentService = await client.DocumentService()
    const documentQuery = {
      parameter: {
        DocumentNumber: documentNumber,
        IncludeFileData: true
      }
    }
    const { result: { GetDocumentsResult } } = await documentService.GetDocuments(documentQuery)
    if (!GetDocumentsResult || !GetDocumentsResult.Successful) throw Error('Unknown error - query failed')
    const documents = GetDocumentsResult.Documents && GetDocumentsResult.Documents.DocumentResult ? GetDocumentsResult.Documents.DocumentResult : []
    const file = documents.Files.DocumentFileResult
    return { file: file.Base64Data }
  } catch (error) {
    throw error
  }
}

async function getDocuments (client, fnr) {
  try {
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
    if (!GetCasesResult || !GetCasesResult.Successful) throw Error('Unknown error - query failed')
    const cases = GetCasesResult.Cases && GetCasesResult.Cases.CaseResult ? GetCasesResult.Cases.CaseResult : {}
    const { CaseNumber } = Array.isArray(cases) ? cases.find(caseItem => caseItem.Status === 'Under behandling') : cases
    if (!CaseNumber) throw Error('Finner ikke elevmappe. Kontakt arkivet.')

    // DocumentService
    const documentQuery = {
      parameter: {
        CaseNumber
      }
    }

    const { result: { GetDocumentsResult } } = await documentService.GetDocuments(documentQuery)
    if (!GetDocumentsResult || !GetDocumentsResult.Successful) throw Error('Unknown error - query failed')
    const documents = GetDocumentsResult.Documents && GetDocumentsResult.Documents.DocumentResult ? GetDocumentsResult.Documents.DocumentResult : []
    // Show only documents that has StatusCode J, E, or F
    const acceptedStatusCodes = [ 'J', 'E', 'F' ]
    const filterDocuments = documents.filter(item => acceptedStatusCodes.includes(item.StatusCode))
    // console.log(JSON.stringify(documents, null, 2))
    const repackedDocuments = filterDocuments.map(documentItem => ({
      id: escape(documentItem.DocumentNumber),
      title: documentItem.Title,
      sortId: documentItem.DocumentNumber.match(/\d/g).join(''),
      files: [{
        from: documentItem.Contacts && Array.isArray(documentItem.Contacts.DocumentContactResult) ? documentItem.Contacts.DocumentContactResult.find(contact => contact.Role === 'Avsender').SearchName : '',
        to: documentItem.Contacts && Array.isArray(documentItem.Contacts.DocumentContactResult) ? documentItem.Contacts.DocumentContactResult.find(contact => contact.Role === 'Mottaker').SearchName : '',
        category: documentItem.Files.DocumentFileResult.CategoryDescription,
        title: documentItem.Files.DocumentFileResult.Title,
        file: escape(documentItem.DocumentNumber)
      }]
    }))
    return { caseNumber: CaseNumber, documents: repackedDocuments }
  } catch (error) {
    throw error
  }
}

module.exports = options => {
  const client = p360(options)
  return {
    getDocuments: (fnr) => getDocuments(client, fnr),
    getFiles: (documentId) => getFiles(client, documentId)
  }
}
