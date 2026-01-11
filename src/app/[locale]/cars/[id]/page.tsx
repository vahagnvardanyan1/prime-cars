import { CarDetailsPage } from "@/components/pages/CarDetailsPage";

export default function CarPage({ params }: { params: { id: string } }) {
  return <CarDetailsPage carId={params.id} />;
}
