declare global {
  interface Window {
    PaystackPop: any;
  }
}

export const initializePayment = ({
  email,
  amount,
  callback,
}: {
  email: string;
  amount: number;
  callback: () => void;
}) => {
  const handler = window.PaystackPop.setup({
    key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
    email,
    amount: amount * 100,
    currency: "NGN",

    callback() {
      callback();
    },

    onClose() {
      console.log("Payment closed");
    },
  });

  handler.openIframe();
};