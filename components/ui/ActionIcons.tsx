'use client'

import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

interface ActionIconsProps {
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  showEdit?: boolean
  showDelete?: boolean
  viewTitle?: string
  editTitle?: string
  deleteTitle?: string
}

export default function ActionIcons({
  onView,
  onEdit,
  onDelete,
  showEdit = true,
  showDelete = true,
  viewTitle = "عرض التفاصيل",
  editTitle = "تعديل",
  deleteTitle = "حذف"
}: ActionIconsProps) {
  return (
    <div className="flex items-center gap-2">
      {onView && (
        <button
          onClick={onView}
          className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
          title={viewTitle}
        >
          <EyeIcon className="w-4 h-4" />
        </button>
      )}
      
      {showEdit && onEdit && (
        <button
          onClick={onEdit}
          className="p-2 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900 rounded-lg transition-colors"
          title={editTitle}
        >
          <PencilIcon className="w-4 h-4" />
        </button>
      )}
      
      {showDelete && onDelete && (
        <button
          onClick={onDelete}
          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
          title={deleteTitle}
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
