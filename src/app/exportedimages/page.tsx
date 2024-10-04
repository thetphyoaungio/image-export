import ImagesList from "@/app/components/ExportedImages";
import { Metadata } from "next";
import DefaultLayout from "@/app/components/Layouts/DefaultLayout";

export const metadata: Metadata = {
  title: "exported images",
  description:
    "This is exported images page.",
};

const ImagesListPage = () => {
  return (
    <DefaultLayout>
      <ImagesList />
    </DefaultLayout>
  );
};

export default ImagesListPage;
