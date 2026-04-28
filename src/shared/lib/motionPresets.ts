export const motionPresets = {
  page(reducedMotion: boolean) {
    return reducedMotion
      ? {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
          exit: { opacity: 1 },
          transition: { duration: 0 },
        }
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -6 },
          transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
        };
  },
  fadeUp(reducedMotion: boolean, delay = 0) {
    return reducedMotion
      ? {
          initial: { opacity: 1, y: 0 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.2 },
        }
      : {
          initial: { opacity: 0, y: 18 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.2 },
          transition: { duration: 0.48, delay, ease: [0.22, 1, 0.36, 1] },
        };
  },
  staggerContainer(reducedMotion: boolean, delayChildren = 0.08) {
    return reducedMotion
      ? {
          initial: 'show',
          whileInView: 'show',
          viewport: { once: true, amount: 0.15 },
          variants: {
            hidden: {},
            show: { transition: { staggerChildren: 0 } },
          },
        }
      : {
          initial: 'hidden',
          whileInView: 'show',
          viewport: { once: true, amount: 0.15 },
          variants: {
            hidden: {},
            show: {
              transition: {
                staggerChildren: delayChildren,
              },
            },
          },
        };
  },
  staggerItem(reducedMotion: boolean) {
    return reducedMotion
      ? {
          variants: {
            hidden: { opacity: 1, y: 0 },
            show: { opacity: 1, y: 0 },
          },
        }
      : {
          variants: {
                hidden: { opacity: 0, y: 14 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
                },
              },
        };
  },
} as const;
