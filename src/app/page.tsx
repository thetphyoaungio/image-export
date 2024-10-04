import ECommerce from "@/app/components/Dashboard/E-commerce";
import { Metadata } from "next";
import DefaultLayout from "@/app/components/Layouts/DefaultLayout";

import MMPriceSetting from "./components/MMPriceSetting";

export const metadata: Metadata = {
  title:
    "Image Export",
  description: "This is Admin Dashboard for Image Export Demo",
};

export default function Home() {
  return (
    <>
      <DefaultLayout>
        <ECommerce />
      </DefaultLayout>
    </>
  );
}
