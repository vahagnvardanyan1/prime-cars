import { CarDetailsPage } from "@/components/pages/CarDetailsPage";

type PageProps = {
  params: {
    id: string;
    locale: string;
  };
};

const Page = ({ params }: PageProps) => {
  return <CarDetailsPage carId={params.id} />;
};

export default Page;
