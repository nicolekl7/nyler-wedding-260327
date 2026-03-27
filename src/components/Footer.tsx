import tuscanySkyline from "@/assets/tuscany-skyline.png";

const Footer = () => (
  <footer className="bg-background overflow-hidden m-0 p-0">
    <img
      src={tuscanySkyline}
      alt=""
      aria-hidden="true"
      loading="lazy"
      width={1920}
      height={512}
      className="block w-full h-auto object-contain opacity-40 pointer-events-none select-none"
    />
  </footer>
);

export default Footer;
