import Image from 'next/image';
import { UpdateButton, DeleteButton } from '@/app/ui/priceSetting/buttons';
import { formatDateToLocal, formatCurrency, formatDateTimeToLocal } from '@/app/lib/utils';
import { fetchFilteredPriceSettings } from '@/app/lib/mmprice-actions';

import Link from 'next/link';

import { format } from 'date-fns/format';
import { getMyDateTimeSubs12 } from '@/app/lib/utils';

export default async function PriceSettingTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const result = await fetchFilteredPriceSettings(query, currentPage);
  const pricesettings = result.data?.data;

  return (
    <div className="flow-root rounded" style={{background:'aliceblue'}}>
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {pricesettings?.map((psett:any) => (
              <div
                key={psett._id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <Image
                        src={psett.imageUrl}
                        className="mr-2 rounded-full"
                        width={50}
                        height={50}
                        alt={`${psett.categoty}'s image`}
                      />
                      <p>{psett.category}</p>
                    </div>
                    <p className="text-sm text-gray-500">Total Prices: {psett.prices?.length}</p>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p>{format(getMyDateTimeSubs12(psett.createdAt.toISOString()), 'MMM dd, yyyy hh:mm a')}</p>
                    <p>{format(getMyDateTimeSubs12(psett.updatedAt.toISOString()), 'MMM dd, yyyy hh:mm a')}</p>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    {/* <UpdateButton id={psett._id} /> */}
                    
                    <Link href={psett.imageUrl} className="text-primary" target='_blank'>
                      View Image
                    </Link>

                    <DeleteButton id={psett._id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                {/* <th scope="col" className="px-2 py-5 font-medium sm:pl-6">
                  No.
                </th> */}
                <th scope="col" className="px-3 py-5 font-medium">
                  Category
                </th>
                <th scope="col" className="px-4 py-5 font-medium">
                  Image
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Total Prices
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Created Date
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Updated Date
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {pricesettings?.map((psett:any, idx:number) => (
                <tr
                key={psett._id}
                className="w-full py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                style={{borderBottom:'2px solid aliceblue'}}
                >
                  {/* <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      {idx + 1}
                    </div>
                  </td> */}
                  <td className="whitespace-nowrap px-3 py-3">
                    {psett.category}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <Image
                    src={psett.imageUrl}
                    width={100}
                    height={100}
                    objectFit='cover'
                    alt={`${psett.category}'s image`}
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {psett.prices?.length}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {format(getMyDateTimeSubs12(psett.createdAt.toISOString()), 'MMM dd, yyyy hh:mm a')}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {format(getMyDateTimeSubs12(psett.updatedAt.toISOString()), 'MMM dd, yyyy hh:mm a')}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center justify-end gap-3">
                      {/* <UpdateButton id={psett._id} /> */}
                      
                      <Link href={psett.imageUrl} className="text-primary underline decoration-primary hover:text-blue-400 hover:decoration-blue-400" target='_blank'>
                      View Image
                      </Link>
                      <DeleteButton id={psett._id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}