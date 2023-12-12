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
const mspLogo = require("../../../../assets/mspMain.png")

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
    flex: 1,
    fontSize: 12,
    fontWeight: "semibold",
    padding: 5,
    textAlign: "left",
    width: "20%",
    // backgroundColor: "#F7F5F0",
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    padding: 5,
    textAlign: "left",
    fontWeight: "light",

    // width: "80%",
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

export const FormPdf = (props) => {
  const NewDoc = (
    <Document>
      <Page size='A4' style={styles.page}>
        {/* //////////////LOGO//////////////////////// */}
        <View style={styles.headerContainer}>
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
        </View>
        {/* //////////////ORG NAME//////////////////////// */}
        <View style={styles.section}>
          {props.orgName ? (
            <Text style={styles.title}>{props.orgName}</Text>
          ) : (
            <Text style={styles.title}>MyStudioPro</Text>
          )}
          <Text style={styles.formType}>{`${props.formName.replace(/_/g, " ")}`}</Text>
        </View>
        {/* ////////////////////FORM VALUES//////////////////////// */}
        <View style={styles.table}>
          {props.fieldValues.map((value, index) =>
            value.type === "client" ? (
              value.dataType === "BOOLEAN" ? (
                <View style={styles.tableRow} key={index}>
                  <Text style={styles.tableHeaderCell}>{value.name}:</Text>
                  <Text style={styles.tableCell}>
                    {value.value === true ? "Yes" : "No"}
                  </Text>
                </View>
              ) : value.dataType === "LIST" ? (
                <View style={styles.tableRow} key={index}>
                  <Text style={styles.tableHeaderCell}>{value.name}:</Text>
                  <Text style={styles.tableCell}>
                    {value.value.map((val, i) => {
                      if (i === value.value.length - 1) return `${val}`;
                      else return `${val}, `;
                    })}
                  </Text>
                </View>
              ) : value.dataType === "TEXT" ? (
                <View style={styles.textRow} key={index}>
                  <Text style={styles.text}>{value.value}</Text>
                </View>
              ) : value.dataType === "SIGNATURE" ? (
                <View style={styles.tableRow} key={index}>
                  <Text style={styles.tableHeaderCell}>{value.name}:</Text>
                  {value.value.length > 0 ? (
                    <Image style={styles.tableCell} src={value.value} />
                  ) : (
                    <Text style={styles.tableCell}>No Signature provided</Text>
                  )}
                </View>
              ) : (
                <View style={styles.tableRow} key={index}>
                  <Text style={styles.tableHeaderCell}>{value.name}:</Text>
                  <Text style={styles.tableCell}>{value.value}</Text>
                </View>
              )
            ) : (
              <View style={styles.tableRow} key={index}>
                <Text style={styles.tableHeaderCell}>{value.name}:</Text>
                <Text style={styles.tableCell}>
                  {value.value === true ? "I agree." : "I do not agree."}
                </Text>
              </View>
            )
          )}
        </View>
      </Page>
    </Document>
  );

  const generatePdfBlob = () => pdf(NewDoc).toBlob();
  return generatePdfBlob();
};
