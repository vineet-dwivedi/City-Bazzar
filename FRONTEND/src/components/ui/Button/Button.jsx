import styles from './Button.module.scss';

export default function Button({
  children, variant = 'primary', size = 'md',
  icon, fullWidth, disabled, onClick, type = 'button', className = ''
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={[
        styles.btn,
        styles[`btn--${variant}`],
        styles[`btn--${size}`],
        fullWidth ? styles['btn--full'] : '',
        className
      ].join(' ')}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </button>
  );
}
