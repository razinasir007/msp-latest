import { gql } from "@apollo/client";

export const GetInvoiceByOrderId = gql(`query GetInvoiceByOrderId ($orderId: String!) {
  invoices {
    lookupByOrder(orderId: $orderId) {
       balanceDueAmount
      createdAt
      createdBy
      currency
      discountAbsoluteAmount
      discountAmountPercentage
      id
   orderSubtotalAmount
      orderId
      paidAmount
      salesTaxAmount
      shippingAmount
      status
      totalAmount
      updatedAt
      updatedBy
    }
  }
}
`);

export const CreateInvoice = gql(`mutation createInvoice(
  $createdBy: String!
  $invoice: InvoiceInput!
) {
  invoices {
    create(
      createdBy: $createdBy,
      invoice: $invoice,
       )
  }
}
`);

export const UploadInvoice = gql(`mutation UploadInvoice(
  $invoiceId: String!
  $pdf:Upload!
) {
  invoices {
    uploadOrUpdateInvoicePdf(
      invoiceId: $invoiceId,
      pdf: $pdf,
       )
  }
}
`);