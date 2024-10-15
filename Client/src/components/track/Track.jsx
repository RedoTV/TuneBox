import styles from './track.module.css'

export default function Track({ track }) {
  return (
    <>
      <li className={styles.track}>
        <h1>{track.id}</h1>
        <p>{track.name}</p>
        <p></p>
      </li>
    </>
  )
}