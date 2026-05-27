// =============================================
//   CS2 DROPS DATABASE — Actualizado Mayo 2026
//   Active Drop Pool oficial (5 items):
//   Dead Hand Terminal, Genesis Terminal,
//   Kilowatt Case, Revolution Case,
//   Dreams & Nightmares Case
// =============================================

export const CS2_DROPS = {
  cajas: [
    { id: "dead_hand_terminal", name: "Sealed Dead Hand Terminal", price: 1.69 },
    { id: "kilowatt_case",      name: "Kilowatt Case",             price: 0.22 },
    { id: "revolution_case",    name: "Revolution Case",           price: 0.28 },
    { id: "genesis_terminal",   name: "Sealed Genesis Terminal",   price: 0.15 },
    { id: "dreams_nightmares",  name: "Dreams & Nightmares Case",  price: 0.08 },
  ],
  // Las armas se agregan manualmente por el usuario
  armas: []
};

// Armas custom guardadas por el usuario en localStorage
export function getCustomWeapons() {
  return JSON.parse(localStorage.getItem('custom_weapons') || '[]');
}

export function saveCustomWeapon(weapon) {
  const weapons = getCustomWeapons();
  weapons.push(weapon);
  localStorage.setItem('custom_weapons', JSON.stringify(weapons));
}

export function deleteCustomWeapon(id) {
  const weapons = getCustomWeapons().filter(w => w.id !== id);
  localStorage.setItem('custom_weapons', JSON.stringify(weapons));
}

// Precios de cajas actualizados desde localStorage
export function getDropsWithPrices() {
  const savedPrices = JSON.parse(localStorage.getItem('custom_prices') || '{}');
  return {
    cajas: CS2_DROPS.cajas.map(item => ({
      ...item,
      price: savedPrices[item.id] !== undefined ? savedPrices[item.id] : item.price
    })),
    armas: getCustomWeapons()
  };
}

export function saveCustomPrice(id, price) {
  const saved = JSON.parse(localStorage.getItem('custom_prices') || '{}');
  saved[id] = price;
  localStorage.setItem('custom_prices', JSON.stringify(saved));
}
