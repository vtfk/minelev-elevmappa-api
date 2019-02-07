const p360 = require('@alheimsins/p360')

async function getFiles (client, documentNumber) {
  try {
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
    return {
      title: file.Title,
      data: file.Base64Data
    }
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
    const cases = GetCasesResult.Cases && GetCasesResult.Cases.CaseResult ? GetCasesResult.Cases.CaseResult : []
    const { CaseNumber } = cases.find(caseItem => caseItem.Status === 'Under behandling')
    if (!CaseNumber) throw Error('Cannot find case')

    // DocumentService
    const documentQuery = {
      parameter: {
        CaseNumber
      }
    }

    const { result: { GetDocumentsResult } } = await documentService.GetDocuments(documentQuery)
    if (!GetDocumentsResult || !GetDocumentsResult.Successful) throw Error('Unknown error - query failed')
    const documents = GetDocumentsResult.Documents && GetDocumentsResult.Documents.DocumentResult ? GetDocumentsResult.Documents.DocumentResult : []
    return documents.map(documentItem => ({
      id: documentItem.DocumentNumber,
      title: documentItem.Title,
      files: {
        from: documentItem.Contacts.DocumentContactResult.find(contact => contact.Role === 'Avsender').SearchName || '',
        to: documentItem.Contacts.DocumentContactResult.find(contact => contact.Role === 'Mottaker').SearchName || '',
        category: documentItem.Files.DocumentFileResult.CategoryDescription,
        title: documentItem.Files.DocumentFileResult.Title
      }
    }
    ))
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
