import { CommonDescriptionItemProps } from "@/components/ui/transaction-items/types";

const CommonDescriptionItem = ({ movement }: CommonDescriptionItemProps) => {
  // Only show description text, not additional info (that's handled by CommonAdditionalInfoProps)
  const description = movement.description;

  if (description) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 sm:bg-gray-50 rounded-xl sm:rounded-lg p-4 sm:p-2 border border-blue-100 sm:border-transparent">
        <p className="text-sm text-gray-700 sm:text-gray-600 leading-relaxed sm:leading-normal">
          {description}
        </p>
      </div>
    );
  }

  return null;
};

export default CommonDescriptionItem;
