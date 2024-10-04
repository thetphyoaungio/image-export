import MMPriceSettingList from "../components/MMPriceSettingList";
import { Metadata } from "next";
import DefaultLayout from "@/app/components/Layouts/DefaultLayout";

import { fetchPriceSettingPages } from "@/app/lib/mmprice-actions";

export const metadata: Metadata = {
  title: "price setting list",
  description:
    "This is Price Setting List.",
};

const MMPriceSettingListPage = async ({
  searchParams
}: {
  searchParams?: {
      query?: string,
      page?: string
  }
}) => {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  const result = await fetchPriceSettingPages(query);

  return (
    <DefaultLayout>
      <MMPriceSettingList query$={query} currentPage$={currentPage} totalPages$={result.data} />
    </DefaultLayout>
  );
};

export default MMPriceSettingListPage;