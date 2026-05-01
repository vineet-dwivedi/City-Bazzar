import { motion } from 'framer-motion';
import styles from './Card.module.scss';

export default function Card({ children, className = '', hover = false, onClick, padding }) {
  return (
    <motion.div
      className={[styles.card, hover ? styles.hoverable : '', className].join(' ')}
      onClick={onClick}
      whileHover={hover ? { y: -2, boxShadow: 'var(--shadow-md)' } : {}}
      transition={{ duration: 0.18 }}
      style={padding ? { padding } : {}}
    >
      {children}
    </motion.div>
  );
}
