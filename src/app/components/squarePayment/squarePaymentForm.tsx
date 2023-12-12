import React from "react";
import { CreditCard, PaymentForm } from "react-square-web-payments-sdk";
import { globalState, useGlobalState } from "../../../state/store";
import Swal from "sweetalert2";
import currency from "currency.js";
import { useMutation } from "@apollo/client";
import { CreateSquarePayment } from "../../../apollo/paymentQueries";
import { useHookstate } from "@hookstate/core";
import { appConfig } from "../../../config";
export const SquarePaymentForm = (props: { orderId; clientId; amount }) => {
  const { orderId, clientId, amount } = props;
  const stateUser = useHookstate(globalState.user);
  const wrappedState = useGlobalState();
  const [SquarePayment, SquarePaymentResponse] =
    useMutation(CreateSquarePayment);
  const handleSubmitClick = async (details, verifiedBuyer) => {
    if (details) {
      SquarePayment({
        variables: {
          createdBy: stateUser!.value!.uid,
          detail: {
            amount: currency(amount).multiply(100),
            currency: "USD",
            clientId: clientId,
            orderId: orderId,
            sourceId: details.token,
          },
        },
        onCompleted: (res) => {
          console.log("response", res);
          if (
            res.payments.squareClientOnetimePayment.success === true &&
            res.payments.squareClientOnetimePayment.status == "COMPLETED"
          ) {
            Swal.fire("Success!", "Payment succeeded!", "success");
            wrappedState.setPaymentCheck(true);
          } else {
            Swal.fire(
              "Error!",
              "Error while processing the payment!. Please try again or check if Square is integrated",
              "error"
            );
          }
        },
      });
    }
  };
  return (
    <div>
      <PaymentForm
        applicationId={appConfig.REACT_APP_SQUARE_APPLICATION_ID}
        cardTokenizeResponseReceived={(token, verifiedBuyer) =>
          handleSubmitClick(token, verifiedBuyer)
        }
        locationId={appConfig.REACT_APP_SQUARE_LOCATION_ID}
      >
        <CreditCard
          buttonProps={{
            css: {
              backgroundColor: "#771520",
              fontSize: "14px",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#530f16",
              },
            },
          }}
        />
      </PaymentForm>
    </div>
  );
};
