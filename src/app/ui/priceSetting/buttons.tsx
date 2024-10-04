import { deletePriceSetting } from '@/app/lib/mmprice-actions';
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export function CreateButton() {
  return (
    <Link
      href="/mmpricesetting"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Create New</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateButton({ id }: { id: string }) {
  return (
    <Link
      href={`/mmpricesetting/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeleteButton({ id }: { id: string }) {
  const deletePriceSettingWithId = deletePriceSetting.bind(null,id);

  return (
    <form action={deletePriceSettingWithId}>
      <button className="rounded-md border p-2 hover:text-rose-400 text-danger">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5" />
      </button>
    </form>
  );
}