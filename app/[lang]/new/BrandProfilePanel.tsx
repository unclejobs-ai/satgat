"use client";

import React from "react";
import {
  BrowserBrandProfileSchema,
  WEB_BRAND_PROFILE_LIMITS,
  type BrowserBrandProfile,
  type WebBrandProfile,
} from "@/lib/design-system/brand-resolver";
import {
  loadBrandProfileFromStorage,
  removeBrandProfileFromStorage,
  saveBrandProfileToStorage,
} from "@/lib/design-system/brand-profile-browser";

type BrandProfilePanelProps = {
  onProfileChange: (profile: WebBrandProfile | null, valid: boolean) => void;
};

const EMPTY_PROFILE: BrowserBrandProfile = {};

export default function BrandProfilePanel({ onProfileChange }: BrandProfilePanelProps) {
  const [checked, setChecked] = React.useState(false);
  const [persist, setPersist] = React.useState(false);
  const [profile, setProfile] = React.useState<BrowserBrandProfile>(EMPTY_PROFILE);
  const [storageMessage, setStorageMessage] = React.useState<string | null>(null);
  const [profileValid, setProfileValid] = React.useState(true);
  const loadedStorage = React.useRef(false);
  const fieldGroupId = React.useId();
  const fieldIdPrefix = React.useId();

  const applyProfile = (candidate: BrowserBrandProfile) => {
    const hasValue = Object.values(candidate).some((value) => value?.trim());
    const parsed = BrowserBrandProfileSchema.safeParse(candidate);
    const valid = !hasValue || parsed.success;
    const normalized = hasValue && parsed.success ? parsed.data : null;
    setProfileValid(valid);
    onProfileChange(normalized, valid);
    return normalized;
  };

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextChecked = event.target.checked;
    setChecked(nextChecked);
    setStorageMessage(null);

    if (!nextChecked) {
      setProfileValid(true);
      onProfileChange(null, true);
      return;
    }

    if (!loadedStorage.current) {
      loadedStorage.current = true;
      const stored = loadBrandProfileFromStorage();
      if (stored.failed) {
        setStorageMessage("저장된 브랜드 정보를 불러오지 못했습니다. 지금 입력한 정보는 계속 사용할 수 있습니다.");
      } else if (stored.profile) {
        setProfile(stored.profile);
        setPersist(true);
        onProfileChange(stored.profile, true);
        return;
      }
    }

    applyProfile(profile);
  };

  const updateField = (field: keyof BrowserBrandProfile, value: string) => {
    const next = { ...profile, [field]: value };
    setProfile(next);
    setStorageMessage(null);
    const normalized = applyProfile(next);

    if (!persist) return;
    const saved = normalized
      ? saveBrandProfileToStorage(normalized)
      : Object.values(next).every((fieldValue) => !fieldValue?.trim())
        ? removeBrandProfileFromStorage()
        : true;
    if (!saved) {
      setStorageMessage("이 브라우저에 저장하지 못했습니다. 문서에는 계속 적용할 수 있습니다.");
    }
  };

  const handlePersistenceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextPersist = event.target.checked;
    setPersist(nextPersist);
    setStorageMessage(null);

    if (!nextPersist) {
      if (!removeBrandProfileFromStorage()) {
        setStorageMessage("저장된 브랜드 정보를 지우지 못했습니다. 브라우저 설정에서 직접 지워 주세요.");
      }
      return;
    }

    const normalized = applyProfile(profile);
    if (normalized && !saveBrandProfileToStorage(normalized)) {
      setStorageMessage("이 브라우저에 저장하지 못했습니다. 문서에는 계속 적용할 수 있습니다.");
    }
  };

  const clearStoredProfile = () => {
    const removed = removeBrandProfileFromStorage();
    setPersist(false);
    setProfile(EMPTY_PROFILE);
    setProfileValid(true);
    onProfileChange(null, true);
    setStorageMessage(
      removed
        ? "이 브라우저에 저장된 브랜드 정보를 지웠습니다."
        : "저장된 브랜드 정보를 지우지 못했습니다. 브라우저 설정에서 직접 지워 주세요.",
    );
  };

  return (
    <section className={`brand-profile ${checked ? "is-open" : ""}`} aria-labelledby={`${fieldIdPrefix}-title`}>
      <div className="brand-profile-toggle">
        <div>
          <p className="brand-profile-kicker">브랜드 결</p>
          <h4 id={`${fieldIdPrefix}-title`}>선택 정보</h4>
        </div>
        <label className="brand-profile-check">
          <input
            type="checkbox"
            checked={checked}
            onChange={handleToggle}
            aria-controls={fieldGroupId}
          />
          <span>이 문서에 브랜드 정보 적용</span>
        </label>
      </div>

      {checked ? (
        <div className="brand-profile-fields" id={fieldGroupId}>
          <p className="brand-profile-scope">입력한 정보는 이 문서 생성 요청에만 적용됩니다.</p>
          <label htmlFor={`${fieldIdPrefix}-name`}>
            <span>이름</span>
            <input
              id={`${fieldIdPrefix}-name`}
              type="text"
              value={profile.name ?? ""}
              onChange={(event) => updateField("name", event.target.value)}
              maxLength={WEB_BRAND_PROFILE_LIMITS.name}
              autoComplete="organization"
              placeholder="예: 결 스튜디오"
            />
          </label>
          <label htmlFor={`${fieldIdPrefix}-role`}>
            <span>역할</span>
            <input
              id={`${fieldIdPrefix}-role`}
              type="text"
              value={profile.role ?? ""}
              onChange={(event) => updateField("role", event.target.value)}
              maxLength={WEB_BRAND_PROFILE_LIMITS.role}
              autoComplete="organization-title"
              placeholder="예: 브랜드 디렉터"
            />
          </label>
          <label className="brand-profile-wide" htmlFor={`${fieldIdPrefix}-website`}>
            <span>웹사이트</span>
            <input
              id={`${fieldIdPrefix}-website`}
              type="url"
              value={profile.website ?? ""}
              onChange={(event) => updateField("website", event.target.value)}
              maxLength={WEB_BRAND_PROFILE_LIMITS.website}
              autoComplete="url"
              inputMode="url"
              placeholder="https://example.com"
              aria-invalid={!profileValid}
            />
          </label>
          <label className="brand-profile-wide" htmlFor={`${fieldIdPrefix}-tone`}>
            <span>말투와 분위기</span>
            <textarea
              id={`${fieldIdPrefix}-tone`}
              value={profile.tone ?? ""}
              onChange={(event) => updateField("tone", event.target.value)}
              maxLength={WEB_BRAND_PROFILE_LIMITS.tone}
              rows={3}
              placeholder="예: 단정하고 따뜻한 한국어"
            />
          </label>
          <div className="brand-profile-persistence brand-profile-wide">
            <label className="brand-profile-check">
              <input type="checkbox" checked={persist} onChange={handlePersistenceChange} />
              <span>이 브라우저에 저장</span>
            </label>
            <p>선택하면 이 기기의 브라우저 저장소에 보관되며, 직접 지우거나 브라우저 저장소를 지울 때까지 남습니다. 계정이나 서버에는 저장하지 않습니다.</p>
            <button type="button" onClick={clearStoredProfile}>저장 정보 지우기</button>
          </div>
          {!profileValid ? (
            <p className="brand-profile-status brand-profile-wide" role="alert">
              웹사이트는 http:// 또는 https://로 시작하는 전체 주소를 입력해 주세요.
            </p>
          ) : null}
          {storageMessage ? <p className="brand-profile-status brand-profile-wide" role="status">{storageMessage}</p> : null}
        </div>
      ) : null}

      <style jsx>{`
        .brand-profile {
          margin-top: 22px;
          padding-top: 20px;
          border-top: 1px solid var(--border-soft, #e8e2d0);
        }
        .brand-profile-toggle {
          display: grid;
          gap: 14px;
        }
        .brand-profile-kicker {
          margin: 0 0 3px;
          font-family: var(--sans);
          font-size: 10px;
          letter-spacing: 0.18em;
          color: var(--brand, #9b1b1b);
        }
        h4 {
          margin: 0;
          font-family: var(--serif-display);
          font-size: 15px;
          color: var(--near-black, #1c1916);
        }
        .brand-profile-check {
          display: grid;
          grid-template-columns: 20px minmax(0, 1fr);
          align-items: center;
          gap: 9px;
          min-height: 40px;
          font-family: var(--serif);
          font-size: 13px;
          line-height: 1.45;
          color: var(--dark-warm, #3a3833);
          cursor: pointer;
        }
        .brand-profile-check input {
          width: 18px;
          height: 18px;
          margin: 0;
          accent-color: var(--brand, #9b1b1b);
        }
        .brand-profile-check input:focus-visible,
        input:focus-visible,
        textarea:focus-visible,
        button:focus-visible {
          outline: 2px solid var(--brand, #9b1b1b);
          outline-offset: 2px;
        }
        .brand-profile-fields {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 13px 10px;
          margin-top: 16px;
        }
        .brand-profile-fields label {
          display: grid;
          gap: 6px;
          min-width: 0;
          font-family: var(--sans);
          font-size: 10px;
          letter-spacing: 0.08em;
          color: var(--stone, #6b6862);
        }
        .brand-profile-wide {
          grid-column: 1 / -1;
        }
        .brand-profile-scope,
        .brand-profile-persistence p,
        .brand-profile-status {
          margin: 0;
          font-family: var(--sans);
          font-size: 11px;
          line-height: 1.55;
          color: var(--stone, #6b6862);
        }
        .brand-profile-fields input,
        .brand-profile-fields textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid var(--border-soft, #e8e2d0);
          border-radius: 4px;
          background: var(--ivory);
          color: var(--near-black, #1c1916);
          font-family: var(--serif);
          font-size: 13px;
          letter-spacing: 0;
        }
        .brand-profile-fields input {
          min-height: 40px;
          padding: 8px 10px;
        }
        .brand-profile-fields textarea {
          min-height: 76px;
          padding: 9px 10px;
          line-height: 1.55;
          resize: vertical;
        }
        .brand-profile-fields input::placeholder,
        .brand-profile-fields textarea::placeholder {
          color: var(--stone, #6b6862);
          opacity: 0.72;
        }
        .brand-profile-persistence {
          display: grid;
          gap: 3px;
          padding-top: 3px;
        }
        .brand-profile-persistence button {
          justify-self: start;
          border: 0;
          padding: 5px 0;
          background: transparent;
          color: var(--brand, #9b1b1b);
          font-family: var(--sans);
          font-size: 11px;
          text-decoration: underline;
          text-underline-offset: 3px;
          cursor: pointer;
        }
        .brand-profile-status {
          color: var(--dark-warm, #3a3833);
        }
        @media (max-width: 520px) {
          .brand-profile-fields {
            grid-template-columns: 1fr;
          }
          .brand-profile-wide {
            grid-column: auto;
          }
        }
      `}</style>
    </section>
  );
}
