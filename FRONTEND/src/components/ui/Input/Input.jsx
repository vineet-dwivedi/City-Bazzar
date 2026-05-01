import styles from './Input.module.scss';

export default function Input({
  label, id, type = 'text', placeholder, value, onChange,
  prefix, suffix, error, className = '', ...props
}) {
  return (
    <div className={[styles.field, className].join(' ')}>
      {label && <label className={styles.label} htmlFor={id}>{label}</label>}
      <div className={`${styles.wrapper} ${error ? styles.hasError : ''}`}>
        {prefix && <span className={styles.prefix}>{prefix}</span>}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={styles.input}
          {...props}
        />
        {suffix && <span className={styles.suffix}>{suffix}</span>}
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
