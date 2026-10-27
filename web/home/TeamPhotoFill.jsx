import styles from "./TeamPhotoFill.module.css";
// Matches the frame baked into the older portraits: a gradient ring ~4.3% of the
// diameter, then a black band ~3.2%, then the photo. Percent padding scales with size,
// so CSS-framed and baked-in photos line up at any avatar size.

/**
 * A team member's photo filling its (round) parent. Older portraits have the frame
 * baked in (cropped to the circle); newer ones get the same frame in CSS via
 * `photoFrame`. Crop settings come from
 * src/data/team.js (photoFrame, photoScale, photoPosition, photoOrigin).
 */
export default function TeamPhotoFill({
  member: m,
  alt,
  loading = "lazy"
}) {
  const img = <img className={[styles.Img, "photo"].join(" ")} src={m.image} alt={alt === undefined ? m.name : alt} loading={loading} style={{
    objectPosition: m.photoPosition || "center",
    transform: `scale(${m.photoScale || 1})`,
    transformOrigin: m.photoOrigin || "center"
  }} />;
  return m.photoFrame ? <div className={styles.Ring}><div><div>{img}</div></div></div> : img;
}
