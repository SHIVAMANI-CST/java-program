import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

const Page = () => redirect(ROUTES.SIGN_IN);
export default Page;
