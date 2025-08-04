let ScrollReveal;
let sr;

if (typeof window !== 'undefined') {
  ScrollReveal = require('scrollreveal').default;
  sr = ScrollReveal();
} else {
  sr = null;
}

export default sr;