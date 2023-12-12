import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  pdf,
} from "@react-pdf/renderer";
// const mspLogo = require("../../../../assets/mspMain.png");

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 15,
    padding: 30,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // Center the contents horizontally
    marginBottom: 20,
  },
  logo: {
    width: 140,
    height: 70,
    marginRight: 10,
  },
  section: {
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    // marginBottom: 10,
    textAlign: "center",
  },
  formType: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  table: {
    marginBottom: 10,
    width: "100%",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "0.5px",
    marginBottom: "4px",
    width: "100%",
  },
  textRow: {
    flexDirection: "row",
  },
  tableHeaderCell: {
    fontSize: 12,
    fontWeight: "semibold",
    padding: 5,
    textAlign: "left",
    width: "33%",
  },
  tableCell: {
    fontSize: 12,
    padding: 5,
    textAlign: "left",
    fontWeight: "light",
    width: "33%",
  },
  text: {
    flex: 1,
    fontSize: 12,
    padding: 5,
    marginTop: 15,
    marginBottom: 15,
    textAlign: "left",
    fontWeight: "bold",
    backgroundColor: "#F7F5F0",
    borderTopLeftRadius: "4px",
    borderTopRightRadius: "4px",
    borderBottomRightRadius: "4px",
    borderBottomLeftRadius: "4px",
  },
});

export const PurchaseOrderPdf = (props) => {
  const NewDoc = (
    <Document>
      <Page size='A4' style={styles.page}>
        {/* //////////////LOGO//////////////////////// */}
        {/* <View style={styles.headerContainer}>
          {props.orgLogo ? (
            <Image
              style={styles.logo}
              src={`data:image/*;base64,${props.orgLogo}`}
            />
          ) : (
            <Image
            style={styles.logo}
            src={mspLogo}
          />
          )}
        </View> */}
        {/* //////////////ORG NAME//////////////////////// */}
        {/* <View style={styles.section}>
          {props.orgName ? (
            <Text style={styles.title}>{props.orgName}</Text>
          ) : (
            <Text style={styles.title}>MyStudioPro</Text>
          )}
          <Text style={styles.formType}>{`${props.formName.replace(/_/g, " ")}`}</Text>
        </View> */}
        {/* ////////////////////FORM VALUES//////////////////////// */}
        <View style={styles.table}>
          {props.products.map((value, index) => (
            <React.Fragment key={index}>
              <View style={styles.section}>
                {/* <Text style={styles.title}>{value.productDetails?.title}</Text> */}
                {/* <Text style={styles.title}>{value.productDetails?.id}</Text> */}
                <Text style={styles.title}>Product 1</Text>
                <Text style={styles.title}>{value.photo.id}</Text>
              </View>
              <View style={styles.tableRow} key={index}>
                <View style={styles.tableCell}>
                  <Text style={styles.tableHeaderCell}>Frame</Text>
                  <Text>{value.frame.id}</Text>
                  <Text>{value.frame.value}</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text style={styles.tableHeaderCell}>Matting</Text>
                  <Text>{value.matting.id}</Text>
                  <Text>{value.matting.value}</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text style={styles.tableHeaderCell}>Size</Text>
                  <Text>{value.size.id}</Text>
                  <Text>{value.size.value}</Text>
                </View>
              </View>
            </React.Fragment>
          ))}
        </View>
      </Page>
    </Document>
  );

  const generatePdfBlob = () => pdf(NewDoc).toBlob();
  return generatePdfBlob();
};
