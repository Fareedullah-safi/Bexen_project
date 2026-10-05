import Contact from "./ContactPages/Contact";
import MapPage from "./ContactPages/MapPage";
import ReachOut from "./ContactPages/ReachOut";

export default function ContactPage() {
  return (
    <main className="pt-4 overflow-x-hidden">
      <Contact />
      <ReachOut />
      <MapPage />
    </main>
  );
}
