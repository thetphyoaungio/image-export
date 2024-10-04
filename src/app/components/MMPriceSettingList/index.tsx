import Pagination from "@/app/ui/pagination";
import Search from "@/app/ui/search";
import Table from "@/app/ui/priceSetting/table";
import { CreateButton } from "@/app/ui/priceSetting/buttons";

import { PriceSettingTableSkeleton } from "@/app/ui/skeletons";
import { Suspense } from "react";

import { fetchPriceSettingPages } from "@/app/lib/mmprice-actions";

import Breadcrumb from "../Breadcrumbs/Breadcrumb";

export default async function MMPriceSettingList({
    query$,
    currentPage$, totalPages$
}: {
    query$?:string|any,
    currentPage$?:string|any,
    totalPages$?:number|any
}) {
    return (
        <div className="mx-auto max-w-7xl">
            <Breadcrumb pageName="Price Setting List" />
            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8 mb-4.5">
                <Search placeholder="Search..." />
                <CreateButton />
            </div>
            <div className="rounded border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="w-full rounded">
                    <Table query={query$} currentPage={currentPage$} />
                </div>
            </div>
            <div className="mt-5 flex w-full justify-center">
                <Pagination totalPages={totalPages$} />
            </div>
        </div>
    )
}