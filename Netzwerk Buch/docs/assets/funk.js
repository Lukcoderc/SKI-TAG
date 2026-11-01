// Gemeinsame Funkrechnung: Sendezeit eines LoRa-Pakets nach der Semtech-Formel.
const LORA_BANDBREITE_HZ = 125000;
const LORA_PRAEAMBEL = 8;

function sendezeitMs(sf, nutzByte = 27) {
  const symbolS = 2 ** sf / LORA_BANDBREITE_HZ;
  const optimierung = sf >= 11 ? 1 : 0;
  const nutzsymbole = 8 + Math.max(Math.ceil((8 * nutzByte - 4 * sf + 44) / (4 * (sf - 2 * optimierung))) * 5, 0);
  return (LORA_PRAEAMBEL + 4.25 + nutzsymbole) * symbolS * 1000;
}

const zahlDe = (wert, stellen = 0) => wert.toFixed(stellen).replace(".", ",").replace("-", "−");
