import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { fetchComments, fetchVideoInfo } from "./services/youtube";
import type { YoutubeVideo } from "./types/video";
import { debounce } from "./utils/debounce";
import "./components/video-item";

@customElement("yt-search")
export class Search extends LitElement {
  @property({ type: String }) searchQuery = "";

  @property({ type: Array }) videos: YoutubeVideo[] = [];

  private _isLoading = false;

  private _sortingOptions = [
    { value: "date", label: "Date" },
    { value: "rating", label: "Rating" },
    { value: "relevance", label: "Relevance" },
  ];

  private _selectedSortOption = "relevance";

  private _fetchVideosDebounced = debounce(() => {
    this._fetchVideos();
  }, 500);

  private async _fetchVideos() {
    try {
      this._isLoading = true;
      const videos = await fetchVideoInfo(this.searchQuery, "relevance");

      const videosWithComments = await Promise.all(
        videos.map(async (video) => {
          try {
            const { comments } = await fetchComments(video.id.videoId);
            return { ...video, comments };
          } catch (error) {
            console.error(
              `Error fetching comments for video ${video.id.videoId}:`,
              error
            );
            return { ...video, comments: [] };
          }
        })
      );

      this.videos = videosWithComments as unknown as YoutubeVideo[];
    } catch (error) {
      console.error("Error fetching videos:", error);
      throw error;
    } finally {
      this._isLoading = false;
    }
  }

  private _onChange(e: Event) {
    this.searchQuery = (e.target as HTMLInputElement).value;
    this._fetchVideosDebounced();
  }

  private _onSortChange(e: Event) {
    this._selectedSortOption = (e.target as HTMLSelectElement).value;
    this._fetchVideosDebounced();
  }

  static styles = css`
    .container {
      margin: 0 auto;
      align-items: center;
    }
    .search-container {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      align-items: center;
      justify-content: space-between;
      padding: 10px;
      border-radius: 8px;
      background-color: #f0f0f0;
      width: 80%;
      max-width: 600px;
    }

    .search-input {
      flex: 1;
      padding: 8px;
      border: none;
      border-radius: 4px;
      font-size: 24px;
      width: 100%;
    }

    .sort-dropdown {
      flex: 1;
      padding: 8px;
      border: none;
      border-radius: 4px;
      font-size: 24px;
      background-color: #000;
      width: 100%;
    }

    .disabled {
      pointer-events: none;
      opacity: 0.5;
    }

    @media screen and (min-width: 768px) {
      .search-container {
        flex-direction: row; /* Reset flex-direction to row on larger screens */
        justify-content: space-between;
        align-items: center;
      }
    }

    .skeleton {
      background-color: #f0f0f0;
      height: 200px; /* Adjust height as needed */
      margin-bottom: 10px; /* Adjust margin as needed */
      border-radius: 8px;
    }
  `;

  render() {
    return html`
      <div class="container">
        <div class="search-container">
          <input
            class="search-input"
            .value=${this.searchQuery}
            @input=${this._onChange}
            placeholder="Search by keyword..."
          />
          <select
            class="sort-dropdown ${this.searchQuery ? "" : "disabled"}"
            @change=${this._onSortChange}
            ?disabled=${!this.searchQuery}
          >
            ${this._sortingOptions.map(
              (option) =>
                html`<option
                  value=${option.value}
                  ?selected=${option.value === this._selectedSortOption}
                >
                  ${option.label}
                </option>`
            )}
          </select>
        </div>

        ${this._isLoading
          ? html`<div class="skeleton"></div>`
          : html`${this.videos.map(
              (video) => html`<video-item .video=${video}></video-item>`
            )}`}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "yt-search": Search;
  }
}
