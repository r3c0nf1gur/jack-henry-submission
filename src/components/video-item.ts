import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { YoutubeVideo } from "../types/video";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

@customElement("video-item")
export class VideoItem extends LitElement {
  @property({ type: Object }) video!: YoutubeVideo;

  static styles = css`
    .container {
      max-width: 100%;
      margin: 0 auto;
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 1rem;
      padding: 1rem;
      background-color: rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(20px);
      border-radius: 1rem;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
      margin-top: 100px;
    }

    .thumbnail {
      border-radius: 1rem;
      overflow: hidden;
    }

    .thumbnail img {
      width: 100%;
      height: auto;
      aspect-ratio: 16/9;
      object-fit: cover;
    }

    .info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .title {
      font-weight: bold;
      font-size: 1.5rem;
      line-height: 2rem;
    }

    .description {
      font-size: 0.875rem;
      line-height: 1.25rem;
      color: #666;
    }

    .metadata {
      font-size: 0.875rem;
      line-height: 1.25rem;
      color: #666;
    }

    .rating-container {
      display: flex;
      align-items: center;
    }

    .rating-value {
      font-weight: bold;
      margin-right: 0.5rem;
    }

    @media screen and (max-width: 768px) {
      .container {
        grid-template-columns: 1fr;
      }
    }
  `;

  render() {
    return html`
      <div class="container">
        <div class="thumbnail">
          <img
            alt="Video Thumbnail"
            src=${this.video.snippet.thumbnails.medium.url}
          />
        </div>
        <div class="info">
          <h1 class="title">
            <a
              href=${`https://www.youtube.com/watch?v=${this.video.id.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              >${unsafeHTML(this.video.snippet.title)}</a
            >
          </h1>
          <p class="description">
            ${unsafeHTML(this.video.snippet.description)}
          </p>
          <div class="metadata">
            Published:
            ${new Date(this.video.snippet.publishedAt).toLocaleDateString()}
          </div>
          <div class="metadata">${this.video.comments.length} comments</div>
        </div>
      </div>
    `;
  }
}
