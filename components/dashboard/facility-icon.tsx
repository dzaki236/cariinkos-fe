import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBath,
  faBed,
  faBicycle,
  faCamera,
  faCar,
  faDumbbell,
  faFire,
  faKitchenSet,
  faLightbulb,
  faLock,
  faMotorcycle,
  faPlug,
  faShirt,
  faShieldHalved,
  faSnowflake,
  faTv,
  faWater,
  faWifi,
  faWind,
  faFan,
  faBolt,
  faDoorOpen,
  faToilet,
  faSink,
  faCouch,
  faChair,
  faTable,
  faUtensils,
  faMugHot,
  faGlassWater,
  faPerson,
  faElevator,
  faStairs,
  faHouse,
  faBuilding,
  faTree,
  faSun,
  faMoon,
  faCloudSun,
  faUmbrella,
  faTrash,
  faBroom,
  faBucket,
  faSoap,
  faTooth,
  faBriefcase,
  faBook,
  faLaptop,
  faMobileScreen,
  faHeadphones,
  faClock,
  faCalendarCheck,
  faBell,
  faEnvelope,
  faPhone,
  faKey,
  faWallet,
  faCreditCard,
  faMoneyBillWave,
  faStore,
  faCartShopping,
  faMugSaucer,
  faBreadSlice,
  faEgg,
  faBottleWater,
  faSeedling,
  faPaw,
  faSmoking,
  faWheelchair,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export const facilityIcons: {
  value: string;
  label: string;
  icon: IconDefinition;
}[] = [
  { value: "fa-solid fa-wifi", label: "Wi-Fi", icon: faWifi },
  { value: "fa-solid fa-bed", label: "Tempat tidur", icon: faBed },
  { value: "fa-solid fa-bath", label: "Kamar mandi", icon: faBath },
  { value: "fa-solid fa-car", label: "Parkir mobil", icon: faCar },
  {
    value: "fa-solid fa-motorcycle",
    label: "Parkir motor",
    icon: faMotorcycle,
  },
  {
    value: "fa-solid fa-snowflake",
    label: "Pendingin ruangan",
    icon: faSnowflake,
  },
  { value: "fa-solid fa-fan", label: "Kipas angin", icon: faFan },
  { value: "fa-solid fa-kitchen-set", label: "Dapur", icon: faKitchenSet },
  { value: "fa-solid fa-shirt", label: "Mesin cuci", icon: faShirt },
  { value: "fa-solid fa-tv", label: "Televisi", icon: faTv },
  { value: "fa-solid fa-dumbbell", label: "Pusat kebugaran", icon: faDumbbell },
  { value: "fa-solid fa-water", label: "Kolam renang", icon: faWater },
  { value: "fa-solid fa-plug", label: "Listrik", icon: faPlug },
  { value: "fa-solid fa-fire", label: "Air panas", icon: faFire },
  {
    value: "fa-solid fa-shield-halved",
    label: "Keamanan",
    icon: faShieldHalved,
  },
  { value: "fa-solid fa-lock", label: "Loker", icon: faLock },
  { value: "fa-solid fa-camera", label: "CCTV", icon: faCamera },
  { value: "fa-solid fa-lightbulb", label: "Meja belajar", icon: faLightbulb },
  { value: "fa-solid fa-bicycle", label: "Parkir sepeda", icon: faBicycle },
  { value: "fa-solid fa-bolt", label: "Listrik cadangan", icon: faBolt },
  { value: "fa-solid fa-wind", label: "Sirkulasi udara", icon: faWind },
  { value: "fa-solid fa-door-open", label: "Pintu pribadi", icon: faDoorOpen },
  { value: "fa-solid fa-toilet", label: "Toilet", icon: faToilet },
  { value: "fa-solid fa-sink", label: "Wastafel", icon: faSink },
  { value: "fa-solid fa-couch", label: "Ruang santai", icon: faCouch },
  { value: "fa-solid fa-chair", label: "Kursi", icon: faChair },
  { value: "fa-solid fa-table", label: "Meja", icon: faTable },
  { value: "fa-solid fa-utensils", label: "Peralatan makan", icon: faUtensils },
  { value: "fa-solid fa-mug-hot", label: "Air minum panas", icon: faMugHot },
  { value: "fa-solid fa-glass-water", label: "Air minum", icon: faGlassWater },
//   { value: "fa-solid fa-kitchen-set", label: "Kulkas", icon: faKitchenSet },
  { value: "fa-solid fa-person", label: "Akses penghuni", icon: faPerson },
  { value: "fa-solid fa-elevator", label: "Lift", icon: faElevator },
  { value: "fa-solid fa-stairs", label: "Tangga", icon: faStairs },
  { value: "fa-solid fa-house", label: "Area hunian", icon: faHouse },
  { value: "fa-solid fa-building", label: "Gedung", icon: faBuilding },
  { value: "fa-solid fa-tree", label: "Taman", icon: faTree },
  { value: "fa-solid fa-sun", label: "Area jemur", icon: faSun },
  { value: "fa-solid fa-moon", label: "Akses 24 jam", icon: faMoon },
  { value: "fa-solid fa-cloud-sun", label: "Area terbuka", icon: faCloudSun },
  { value: "fa-solid fa-umbrella", label: "Kanopi", icon: faUmbrella },
  { value: "fa-solid fa-trash", label: "Tempat sampah", icon: faTrash },
  { value: "fa-solid fa-broom", label: "Layanan kebersihan", icon: faBroom },
  { value: "fa-solid fa-bucket", label: "Peralatan kebersihan", icon: faBucket },
  { value: "fa-solid fa-soap", label: "Sabun", icon: faSoap },
  { value: "fa-solid fa-tooth", label: "Perlengkapan mandi", icon: faTooth },
  { value: "fa-solid fa-briefcase", label: "Area kerja", icon: faBriefcase },
  { value: "fa-solid fa-book", label: "Rak buku", icon: faBook },
  { value: "fa-solid fa-laptop", label: "Meja kerja", icon: faLaptop },
  { value: "fa-solid fa-mobile-screen", label: "Pengisian daya", icon: faMobileScreen },
  { value: "fa-solid fa-headphones", label: "Area tenang", icon: faHeadphones },
  { value: "fa-solid fa-clock", label: "Jam malam", icon: faClock },
  { value: "fa-solid fa-calendar-check", label: "Sewa bulanan", icon: faCalendarCheck },
  { value: "fa-solid fa-bell", label: "Bel layanan", icon: faBell },
  { value: "fa-solid fa-envelope", label: "Kotak surat", icon: faEnvelope },
  { value: "fa-solid fa-phone", label: "Telepon", icon: faPhone },
  { value: "fa-solid fa-key", label: "Kunci kamar", icon: faKey },
  { value: "fa-solid fa-wallet", label: "Pembayaran digital", icon: faWallet },
  { value: "fa-solid fa-credit-card", label: "Kartu pembayaran", icon: faCreditCard },
  { value: "fa-solid fa-money-bill-wave", label: "Pembayaran tunai", icon: faMoneyBillWave },
  { value: "fa-solid fa-store", label: "Minimarket", icon: faStore },
  { value: "fa-solid fa-cart-shopping", label: "Layanan belanja", icon: faCartShopping },
  { value: "fa-solid fa-mug-saucer", label: "Kedai kopi", icon: faMugSaucer },
  { value: "fa-solid fa-bread-slice", label: "Sarapan", icon: faBreadSlice },
  { value: "fa-solid fa-egg", label: "Fasilitas memasak", icon: faEgg },
  { value: "fa-solid fa-bottle-water", label: "Air galon", icon: faBottleWater },
  { value: "fa-solid fa-seedling", label: "Area hijau", icon: faSeedling },
  { value: "fa-solid fa-paw", label: "Ramah hewan", icon: faPaw },
  { value: "fa-solid fa-smoking", label: "Area merokok", icon: faSmoking },
  { value: "fa-solid fa-wheelchair", label: "Akses kursi roda", icon: faWheelchair },
];

export function FacilityIcon({
  value,
  name,
  size = 20,
}: {
  value?: string | null;
  name?: string;
  size?: number;
}) {
  const match = facilityIcons.find((item) => item.value === value);
  if (!match) {
    return (
      <span
        className="facility-icon-fallback"
        aria-label={name ?? "Ikon fasilitas"}
      >
        {name?.slice(0, 1).toLocaleUpperCase("id-ID") ?? "?"}
      </span>
    );
  }
  return (
    <FontAwesomeIcon
      icon={match.icon}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}
