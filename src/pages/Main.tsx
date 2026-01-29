import DialogDrawer from "@/components/DialogDrawer";
import { OfflineBanner } from "@/components/OfflineBanner";
import Table from "@/components/Table";
import Header from "./../components/Header";

function Main() {
  return (
    <>
      <OfflineBanner />
      <div className="w-10/12 mx-auto py-4">
        <Header />
        <Table />
        <DialogDrawer />
      </div>
    </>
  );
}

export default Main;
