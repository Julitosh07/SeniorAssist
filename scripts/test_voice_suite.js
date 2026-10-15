/**
 * SeniorAssist - Suite de Pruebas de Procesamiento y Parsing Fonético de Voz
 * Valida extracción de llamadas, mensajes WhatsApp con modismos y desambiguación de contactos.
 */

function normalize(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function parseCallVoiceCommand(spokenText) {
  if (!spokenText) return null;
  let text = spokenText.trim();

  text = text.replace(/^(?:oye\s+asistente|hola\s+asistente|asistente|asistenta|asistentes|asistencia|asiste|por\s+favor)\s*[,:\.]?\s*/i, '').trim();

  const callRegex = /^(?:(?:por\s+favor\s+)?(?:quiero\s+)?(?:hacer\s+una\s+llamada\s+a|haz\s+una\s+llamada\s+a|ll[aá]ma(?:le)?\s+a|llamar\s+a|marca(?:r)?\s+a|comun[ií]came\s+con|hablar\s+con|llamar|llama))\s+/i;
  const match = text.match(callRegex);
  if (!match) return null;

  let afterPrefix = text.substring(match[0].length).trim();
  if (!afterPrefix) return null;

  const cleanContact = afterPrefix.replace(/^(?:a\s+mi\s+|a\s+la\s+|a\s+|al\s+|mi\s+|el\s+|la\s+)/i, '').trim();
  const finalContact = cleanContact.replace(/[.,?!¿¡]/g, '').trim();

  if (finalContact.length > 0) {
    return {
      isMatch: true,
      contact: finalContact,
    };
  }

  return null;
}

function parseWhatsAppVoiceCommand(spokenText) {
  if (!spokenText) return null;
  let text = spokenText.trim();

  text = text.replace(/^(?:oye\s+asistente|hola\s+asistente|asistente|asistenta|asistentes|asistencia|asiste|por\s+favor)\s*[,:\.]?\s*/i, '').trim();

  const prefixRegex = /^(?:m[aá]nda(?:le)?\s+(?:un\s+)?(?:mensaje(?:\s+de\s+whatsapp)?|whatsapp)\s+a|env[ií]a(?:le)?\s+(?:un\s+)?(?:mensaje(?:\s+de\s+whatsapp)?|whatsapp)\s+a|escr[ií]be(?:le)?\s+(?:un\s+)?(?:mensaje(?:\s+de\s+whatsapp)?|whatsapp)?\s*a|whatsapp\s+a|mensaje\s+a)\s+/i;
  const prefixMatch = text.match(prefixRegex);
  if (!prefixMatch) return null;

  const afterPrefix = text.substring(prefixMatch[0].length).trim();
  if (!afterPrefix) return null;

  const sepRegex = /^(.*?)\s+(?:dici[eé]ndole(?:\s+que)?|diciendo\s+que|diciendo|dile\s+que|dile|que\s+diga|que\s+dice|con\s+el\s+mensaje|con\s+el\s+texto)\s+(.*)$/i;
  const sepMatch = afterPrefix.match(sepRegex);
  if (sepMatch) {
    const recipient = sepMatch[1].replace(/^(?:a\s+mi\s+|a\s+la\s+|a\s+|al\s+|mi\s+|el\s+|la\s+)/i, '').trim();
    const message = sepMatch[2].trim();
    if (recipient && message) {
      return { isMatch: true, recipient, message };
    }
  }

  const queRegex = /^(.*?)\s+que\s+(.*)$/i;
  const queMatch = afterPrefix.match(queRegex);
  if (queMatch) {
    const candidateRecipient = queMatch[1].replace(/^(?:a\s+mi\s+|a\s+la\s+|a\s+|al\s+|mi\s+|el\s+|la\s+)/i, '').trim();
    const message = queMatch[2].trim();
    const words = candidateRecipient.split(/\s+/);
    if (words.length <= 4 && candidateRecipient.length > 0 && message.length > 0) {
      return { isMatch: true, recipient: candidateRecipient, message };
    }
  }

  const saludoRegex = /^(.*?)\s+(hola.*|buenos\s+d[ií]as.*|buenas\s+tardes.*|buenas\s+noches.*)$/i;
  const saludoMatch = afterPrefix.match(saludoRegex);
  if (saludoMatch) {
    const candidateRecipient = saludoMatch[1].replace(/^(?:a\s+mi\s+|a\s+la\s+|a\s+|al\s+|mi\s+|el\s+|la\s+)/i, '').trim();
    const message = saludoMatch[2].trim();
    const words = candidateRecipient.split(/\s+/);
    if (words.length <= 4 && candidateRecipient.length > 0 && message.length > 0) {
      return { isMatch: true, recipient: candidateRecipient, message };
    }
  }

  const tokens = afterPrefix.split(/\s+/);
  if (tokens.length >= 2) {
    const candidateRecipient = tokens[0].replace(/^(?:a\s+mi\s+|a\s+la\s+|a\s+|al\s+|mi\s+|el\s+|la\s+)/i, '').trim();
    const candidateMessage = tokens.slice(1).join(' ').trim();
    if (candidateRecipient.length > 0 && candidateMessage.length > 0) {
      return { isMatch: true, recipient: candidateRecipient, message: candidateMessage };
    }
  }

  const singleRecipient = afterPrefix.replace(/^(?:a\s+mi\s+|a\s+la\s+|a\s+|al\s+|mi\s+|el\s+|la\s+)/i, '').trim();
  return {
    isMatch: true,
    recipient: singleRecipient,
    message: 'Hola, te escribo con SeniorAssist',
  };
}

let passed = 0;
let total = 0;
function test(name, cond) {
  total++;
  if (cond) {
    passed++;
    console.log(`✅ [VOZ PASS]: ${name}`);
  } else {
    console.error(`❌ [VOZ FAIL]: ${name}`);
  }
}

console.log('========================================================');
console.log('🎙️ SUITE DE PRUEBAS DE COMANDOS DE VOZ Y PARSING');
console.log('========================================================\n');

// 1. Tests Call Voice Command
const call1 = parseCallVoiceCommand('llama a mama');
test("Reconocimiento de llamada informal: 'llama a mama'", call1?.contact === 'mama');

const call2 = parseCallVoiceCommand('llama a mi mamá');
test("Reconocimiento con tildes y posesivo: 'llama a mi mamá'", call2?.contact === 'mamá');

const call3 = parseCallVoiceCommand('llamar a Carlos');
test("Reconocimiento con infinitivo: 'llamar a Carlos'", call3?.contact === 'Carlos');

const call4 = parseCallVoiceCommand('asistente llama a Pedro');
test("Reconocimiento con palabra clave wake-word: 'asistente llama a Pedro'", call4?.contact === 'Pedro');

// 2. Tests WhatsApp Voice Command
const wa1 = parseWhatsAppVoiceCommand('manda mensaje a mama');
test("Comando WhatsApp sin mensaje previo: 'manda mensaje a mama'", wa1?.recipient === 'mama');

const wa2 = parseWhatsAppVoiceCommand('manda mensaje a mi mamá que la amo');
test("Extracción de mensaje y destinatario: 'manda mensaje a mi mamá que la amo'", wa2?.recipient === 'mamá' && wa2?.message === 'la amo');

// 3. Tests Exact Match Logic
const contacts = [
  { name: 'Mamá', phone: '3001111111' },
  { name: 'Mamá Celular', phone: '3002222222' },
];

const normQ = normalize('mama');
const exact = contacts.filter(c => normalize(c.name) === normQ);
test("Desambiguación estricta de contacto (evita falsos positivos con 'Mamá Celular')", exact.length === 1 && exact[0].name === 'Mamá');

console.log(`\n========================================================`);
console.log(`📊 RESULTADO DE VOZ: ${passed}/${total} PRUEBAS SUPERADAS`);
console.log(`========================================================`);

if (passed !== total) process.exit(1);
