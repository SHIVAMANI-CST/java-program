import { featureIntroContent, gradientTextClass } from "@/constants/constants";

const FeatureIntro: React.FC<{ feature: string }> = ({ feature }) => {
  const data = featureIntroContent[feature as keyof typeof featureIntroContent];
  if (!data) return null;

  return (
    <>
      {/* Title and Caption */}
      <div className="px-2 md:px-2 lg:px-2 xl:px-2">
        <h1 className="text-[0.875rem] md:text-xl lg:text-xl xl:text-2xl font-semibold text-gray-900 leading-tight min-h-[2rem] md:min-h-[2.5rem] lg:min-h-[2rem] xl:min-h-[2.5rem]">
          {data.title} GPT Outputs
        </h1>
        <p className="text-[0.6875rem] md:text-xs lg:text-xs xl:text-sm text-gray-500 mt-1 md:mt-2 lg:mt-2 xl:mt-2 leading-snug min-h-[1rem] md:min-h-[1.25rem] lg:min-h-[1.25rem] xl:min-h-[1.25rem]">
          {data.caption}
        </p>
      </div>

      {/* Feature Card */}
      <div className="bg-[#FAFAFB] rounded-lg p-2.5 md:p-3 lg:p-3 xl:p-4 text-left shadow-sm max-w-full md:max-w-md lg:max-w-md xl:max-w-lg 2xl:max-w-xl mx-2 md:mx-3 lg:mx-2 xl:mx-4">
        <h2 className="font-semibold text-[0.75rem] md:text-sm lg:text-sm xl:text-base text-center leading-tight min-h-[1.25rem] md:min-h-[1.5rem] lg:min-h-[1.25rem] xl:min-h-[1.5rem]">
          <span className={`${gradientTextClass}`}>{data.title}</span>
        </h2>
        <p className="text-[0.6875rem] md:text-xs lg:text-xs xl:text-sm text-gray-600 leading-snug min-h-[1rem] md:min-h-[1.25rem] lg:min-h-[1.25rem] xl:min-h-[1.25rem]">
          {data.description}
        </p>
      </div>
    </>
  );
};

export default FeatureIntro;
