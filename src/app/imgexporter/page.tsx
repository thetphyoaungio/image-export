import ImageExporter from "@/app/components/ImageExporter";
import { Metadata } from "next";
import DefaultLayout from "@/app/components/Layouts/DefaultLayout";

export const metadata: Metadata = {
  title: "img-exporter",
  description:
    "This is image exporter page.",
};

const ImgExporterPage = () => {
  return (
    <DefaultLayout>
      <ImageExporter />
    </DefaultLayout>
  );
};

export default ImgExporterPage;
