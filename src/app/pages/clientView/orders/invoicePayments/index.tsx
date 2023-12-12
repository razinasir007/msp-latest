import { useQuery } from "@apollo/client";
import { Box } from "@chakra-ui/react";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { GetClient } from "../../../../../apollo/clientQueries";
import { GetInvoiceByOrderId } from "../../../../../apollo/invoices";
import { GetOrders } from "../../../../../apollo/orderQueries";
import { GetClientPaymentsByOrderId } from "../../../../../apollo/paymentQueries";
import { InvoiceDetails } from "../../../../../state/interfaces";
import { useGlobalState } from "../../../../../state/store";
import { Invoice } from "../../../../components/clientView/invoice/invoice";
import { Payment } from "../../../../components/clientView/payment/payment";

export const ClinetViewInvoice = (props: { clientId; orderId }) => {
  const state = useGlobalState();
  const customPaymentCheck = state.getCustomPaymentCheck();
  const [invoiceState, setInvoiceState] = useState<InvoiceDetails[]>([]);
  const [paymentsState, setPaymentState] = useState([]);
  const { loading: clientLoading, data: ClientDetails } = useQuery(GetClient, {
    variables: { userId: props.clientId },
  });

  const { loading: OrderLoading, data: OrderData } = useQuery(GetOrders, {
    variables: { orderId: props.orderId },
  });

  const { loading: InvoiceLoading, data: InvoiceData } = useQuery(
    GetInvoiceByOrderId,
    {
      variables: { orderId: props.orderId },
    }
  );
  const {
    loading: PaymentsLoading,
    data: PaymentsData,
    refetch: RefetchPayments,
  } = useQuery(GetClientPaymentsByOrderId, {
    variables: { orderId: props.orderId },
  });
  useEffect(() => {
    if (customPaymentCheck) {
      RefetchPayments().then((val) => {
        state.setCustomPaymentCheck(false);
      });
    }
  }, [customPaymentCheck]);
  useEffect(() => {
    if (
      InvoiceData &&
      InvoiceData.invoices &&
      InvoiceData.invoices.lookupByOrder
    ) {
      const formattedData = [
        {
          id: InvoiceData.invoices.lookupByOrder?.id,
          balanceDue: InvoiceData.invoices.lookupByOrder?.balanceDueAmount,
          createdAt: InvoiceData.invoices.lookupByOrder?.createdAt,
          currency: InvoiceData.invoices.lookupByOrder?.currency,
          discountAbsoluteAmount:
            InvoiceData.invoices.lookupByOrder?.discountAbsoluteAmount,
          discountAmountPercentage:
            InvoiceData.invoices.lookupByOrder?.discountAmountPercentage,
          orderSubtotalAmount:
            InvoiceData.invoices.lookupByOrder?.orderSubtotalAmount,
          orderId: InvoiceData.invoices.lookupByOrder?.orderId,
          paidAmount: InvoiceData.invoices.lookupByOrder?.paidAmount,
          salesTaxAmount: InvoiceData.invoices.lookupByOrder?.salesTaxAmount,
          shippingAmount: InvoiceData.invoices.lookupByOrder?.shippingAmount,
          status: InvoiceData.invoices.lookupByOrder?.status,
          totalAmount: InvoiceData.invoices.lookupByOrder?.totalAmount,
        },
      ];

      setInvoiceState(formattedData);
    }
  }, [InvoiceData]);

  useEffect(() => {
    if (PaymentsData) {
      const formattedData =
        PaymentsData.payments.lookupClientPaymentsByOrder.map((ele) => ({
          id: ele.id,
          orderId: ele.orderId,
          status: ele.status,
          paymentDate: moment(ele.paidAt).format("MMMM Do YYYY"),
          amountPaid: ele.status === "PAID" ? ele.amount : "-",
          amountRemaining: "-",
          type: "-",
        }));
      setPaymentState(formattedData);
    }
  }, [PaymentsData]);

  return (
    <>
      <Box>
        <Invoice
          invoice={invoiceState}
          loading={clientLoading || OrderLoading || InvoiceLoading}
          invoiceNumber={invoiceState[0]?.id}
          clientName={ClientDetails?.clients?.lookupClient.fullname}
          status={invoiceState[0]?.status}
          discountPercentage={invoiceState[0]?.discountAmountPercentage}
          absoluteDiscountValue={invoiceState[0]?.discountAbsoluteAmount}
          issueDate={moment(invoiceState[0]?.createdAt).format("MMMM Do YYYY")}
          clientEmail={ClientDetails?.clients?.lookupClient.email}
          balanceDue={` $${invoiceState[0]?.balanceDue}`}
          dueDate={
            OrderData?.orders?.lookup?.dueDate === null || undefined
              ? "-"
              : moment(OrderData?.orders?.lookup?.dueDate).format(
                  "MMMM Do YYYY"
                )
          }
          items={OrderData?.orders?.lookup?.numberOfProducts}
          salesTax={`$${invoiceState[0]?.salesTaxAmount}`}
          subtotal={`$${invoiceState[0]?.orderSubtotalAmount}`}
          amount={`$${invoiceState[0]?.orderAmount}`}
          shipping={`$${invoiceState[0]?.shippingAmount}`}
          total={`$${invoiceState[0]?.totalAmount}`}
          amountPaid={`$${invoiceState[0]?.paidAmount}`}
          totalBalanceDue={`$${invoiceState[0]?.balanceDue}`}
        />
      </Box>
      <Box mt='20px'>
        <Payment
          rowData={paymentsState}
          paymentLoading={PaymentsLoading}
          clientId={props.clientId}
          orderId={props.orderId}
        />
      </Box>
    </>
  );
};
