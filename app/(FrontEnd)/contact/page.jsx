import Contact from "./ContactPages/Contact";
import MapPage from "./ContactPages/MapPage";
import ReachOut from "./ContactPages/ReachOut";

export default function ContactPage() {
  return (
    <main className="pt-4">
      <Contact />
      <ReachOut />
      <MapPage />
    </main>
  );
}
