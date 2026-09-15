import { asList, difficultyName, tourStatus } from "../api/responseUtils";

export function KeyPoints({ points, title = "Key points" }) {
  const list = asList(points);
  return <section>
    <h2>{title}</h2>
    {list.length === 0 && <p>No key points returned.</p>}
    {list.map((point, index) => <div className="item-card" key={point.id || index}>
      <h3>{point.name || "Key point " + (index + 1)}</h3>
      <p>{point.description}</p>
      <p>Latitude: {point.latitude}; longitude: {point.longitude}</p>
      {point.image && <div className="image-list"><img src={point.image} alt={point.name || "Key point"} /></div>}
    </div>)}
  </section>;
}

export default function TourContent({ tour, preview = false }) {
  return <>
    <h2>{tour.name}</h2>
    <p>{tour.description}</p>
    {tour.isPurchased === true && <p className="success">Purchased</p>}
    <p>Status: {tourStatus(tour.status)} | Price: {tour.price ?? 0}</p>
    <p>Length: {tour.length ?? 0} | Duration: {tour.duration ?? 0}</p>
    <p>Difficulty: {difficultyName(tour.difficulty)}</p>
    <p>Tags: {asList(tour.tags).join(", ") || "None"}</p>
    <div className="image-list">
      {asList(tour.images).map((url, index) => <img key={index} src={url} alt={tour.name || "Tour"} />)}
    </div>
    <h3>Reviews</h3>
    {asList(tour.reviews).length === 0 && <p>No reviews yet.</p>}
    {asList(tour.reviews).map((review, index) => <p key={index}>{review}</p>)}
    {preview && <KeyPoints
      points={tour.isPurchased === true ? asList(tour.keyPoints) : asList(tour.keyPoints).slice(0, 1)}
      title={tour.isPurchased === true ? "All tour key points" : "Starting point"} />}
  </>;
}