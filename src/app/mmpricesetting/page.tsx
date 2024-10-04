import MMPriceSetting from "../components/MMPriceSetting";
import { Metadata } from "next";
import DefaultLayout from "@/app/components/Layouts/DefaultLayout";

export const metadata: Metadata = {
  title: "price-setting",
  description:
    "This is Price Setting.",
};

const MMPriceSettingPage = () => {
  return (
    <DefaultLayout>
      <MMPriceSetting />
    </DefaultLayout>
  );
};

export default MMPriceSettingPage;