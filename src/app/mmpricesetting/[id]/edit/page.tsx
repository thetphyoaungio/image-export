import MMPriceSettingEdit from "@/app/components/MMPriceSettingEdit";
import { Metadata } from "next";
import DefaultLayout from "@/app/components/Layouts/DefaultLayout";
import { fetchPriceSettingById } from "@/app/lib/mmprice-actions";

import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "price-setting-edit",
  description:
    "This is Price Setting Edit.",
};

const MMPriceSettingEditPage = async ({ params }: { params: { id: string}}) => {
    const id = params.id;

    const result = await fetchPriceSettingById(id);
    //console.log('got result>>>> ',result)

    const result$ = JSON.parse(result);
    const priceSetting$ = result$.data;

    if(!priceSetting$) {
        notFound();
    }

    return (
        <DefaultLayout>
        <MMPriceSettingEdit editdata={priceSetting$} />
        </DefaultLayout>
    );
};

export default MMPriceSettingEditPage;