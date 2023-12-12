import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Image,
} from "@react-pdf/renderer";
import { Button, HStack } from "@chakra-ui/react";
import { useMutation } from "@apollo/client";
import { SendEmail } from "../../../../apollo/userQueries";
import { CLIENT_ROLE, fileToBase64 } from "../../../../constants";
import Swal from "sweetalert2";
import { UploadInvoice } from "../../../../apollo/invoices";
import { useHookstate } from "@hookstate/core";
import { globalState } from "../../../../state/store";
const logo = require("../../../../assets/mspMain.png");
// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 14,
    padding: 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 50,
    marginRight: 10,
  },
  section: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    marginTop: "15px",
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  table: {
    marginBottom: 10,
    marginTop: "20px",
    marginLeft: "50px",
    width: "100%",
  },
  tableRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
  },
  footer: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 14,
  },
});

export const InvoicePdf = (props: { data; isCheckout? }) => {
  const { data, isCheckout } = props;
  const user = useHookstate(globalState.user);
  const [SendInvoice, SnedInvoiceEmailResponse] = useMutation(SendEmail);
  const [UploadInvoiceToCloud, UploadInvoiceResponse] =
    useMutation(UploadInvoice);
  const handleSendEmail = async (pdfBlob) => {
    try {
      // Convert the PDF blob into a file object with a name
      const pdfFile = new File([pdfBlob], "invoice.pdf", {
        type: "application/pdf",
      });

      const base64Content = await fileToBase64(pdfFile);

      // //Call the sendEmail mutation to send the email with the PDF attachment
      await SendInvoice({
        variables: {
          email: {
            email: data.clientEmail,
            subject: "Invoice",
            content: `
                    <html>
                    <body>
                      <p>Dear ${data.clientName},</p>

                      <p>Please find the attached invoice PDF for your recent purchase.</p>

                      <p>If you have any questions or concerns about this invoice, please don't hesitate to contact us.</p>

                      <p>Thank you for using MyStudio Pro !</p>

                      <p>Sincerely,</p>
                      <p>MyStudio Pro</p>
                    </body>
                  </html>
  `,
          },
          attachments: [
            {
              filename: "invoice.pdf",
              content: base64Content,
              contentType: "application/pdf",
            },
          ],
        },
        onCompleted: (res) => {
          console.log("response", res);
          if (res.emails.send === true) {
            Swal.fire({
              icon: "success",
              titleText: "Invoice Sent",
              text: `Your invoice has been sent to ${data.clientEmail} successfully`,
            });
          }
        },
      });

      // If the email is sent successfully, show a success message or handle the response as needed
    } catch (error) {
      // Handle any errors that occur during the sendEmail mutation
      console.error("Error sending email:", error);
    }
  };
  const handleSaveToCloud = async (pdfblob) => {
    try {
      const pdfFile = new File([pdfblob], "invoice.pdf", {
        type: "application/pdf",
      });

      UploadInvoiceToCloud({
        variables: {
          invoiceId: data.invoiceNumber,
          pdf: pdfFile,
        },
      });
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <div>
      <PDFDownloadLink
        document={
          <Document>
            <Page size='A4' style={styles.page}>
              <View style={styles.headerContainer}>
                <Image src={logo} style={styles.logo} />
              </View>
              <View style={styles.section}>
                <Text style={styles.title}>Invoice: {data.invoiceNumber}</Text>

                <View style={styles.table}>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableHeaderCell}>Client:</Text>
                    <Text style={styles.tableCell}>{data.clientName}</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableHeaderCell}>Status:</Text>
                    <Text style={styles.tableCell}>{data.status}</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableHeaderCell}>Issue Date:</Text>
                    <Text style={styles.tableCell}>{data.issueDate}</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableHeaderCell}>Contact:</Text>
                    <Text style={styles.tableCell}>{data.clientEmail}</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableHeaderCell}>Balance Due:</Text>
                    <Text style={styles.tableCell}>{data.balanceDue}</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableHeaderCell}>Due Date:</Text>
                    <Text style={styles.tableCell}>{data.dueDate}</Text>
                  </View>
                </View>

                <Text style={styles.title}>Order</Text>

                <View style={styles.table}>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableHeaderCell}>Items:</Text>
                    <Text style={styles.tableCell}>{data.items}</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableHeaderCell}>Sales Tax:</Text>
                    <Text style={styles.tableCell}>{data.salesTax}</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableHeaderCell}>Subtotal:</Text>
                    <Text style={styles.tableCell}>{data.subtotal}</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableHeaderCell}>Shipping:</Text>
                    <Text style={styles.tableCell}>{data.shipping}</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableHeaderCell}>Total:</Text>
                    <Text style={styles.tableCell}>{data.total}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.footer}>
                <Text>Thank you for using MyStudio Pro!</Text>
              </View>
            </Page>
          </Document>
        }
        fileName='invoice.pdf'
      >
        {({ blob, url, loading, error }) => (
          <>
            <HStack spacing={5}>
              <Button size='sm' variant='outline'>
                {loading ? "Generating PDF..." : "Download PDF"}
              </Button>
              {user.get()?.role?.name === CLIENT_ROLE.name ? null : (
                <>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => handleSaveToCloud(blob)}
                  >
                    Save to cloud
                  </Button>
                  <Button size='sm' onClick={() => handleSendEmail(blob)}>
                    Send Invoice
                  </Button>
                </>
              )}
            </HStack>
          </>
        )}
      </PDFDownloadLink>
    </div>
  );
};
