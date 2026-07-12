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
import styles from "./new-document.module.css";

type BrandProfilePanelProps = {
  disabled: boolean;
  onProfileChange: (profile: WebBrandProfile | null, valid: boolean) => void;
};

const EMPTY_PROFILE: BrowserBrandProfile = {};

export default function BrandProfilePanel({
  disabled,
  onProfileChange,
}: BrandProfilePanelProps) {
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
    <section
      className={styles.brandProfile}
      aria-labelledby={`${fieldIdPrefix}-title`}
      aria-busy={disabled}
    >
      <div className={styles.brandProfileToggle}>
        <div>
          <p className={styles.eyebrow}>선택 정보</p>
          <h3 id={`${fieldIdPrefix}-title`}>브랜드 정보</h3>
        </div>
        <label className={styles.brandProfileCheck}>
          <input
            type="checkbox"
            checked={checked}
            onChange={handleToggle}
            aria-controls={fieldGroupId}
            disabled={disabled}
          />
          <span>이 문서에 브랜드 정보 적용</span>
        </label>
      </div>

      {checked ? (
        <div className={styles.brandProfileFields} id={fieldGroupId}>
          <p className={`${styles.brandProfileScope} ${styles.brandProfileWide}`}>
            입력한 정보는 이 문서 생성 요청에만 적용됩니다.
          </p>
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
              disabled={disabled}
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
              disabled={disabled}
            />
          </label>
          <label className={styles.brandProfileWide} htmlFor={`${fieldIdPrefix}-website`}>
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
              disabled={disabled}
            />
          </label>
          <label className={styles.brandProfileWide} htmlFor={`${fieldIdPrefix}-tone`}>
            <span>말투와 분위기</span>
            <textarea
              id={`${fieldIdPrefix}-tone`}
              value={profile.tone ?? ""}
              onChange={(event) => updateField("tone", event.target.value)}
              maxLength={WEB_BRAND_PROFILE_LIMITS.tone}
              rows={3}
              placeholder="예: 단정하고 따뜻한 한국어"
              disabled={disabled}
            />
          </label>
          <div className={`${styles.brandProfilePersistence} ${styles.brandProfileWide}`}>
            <label className={styles.brandProfileCheck}>
              <input
                type="checkbox"
                checked={persist}
                onChange={handlePersistenceChange}
                disabled={disabled}
              />
              <span>이 브라우저에 저장</span>
            </label>
            <p>
              이 기기의 브라우저 저장소에만 보관되며, 계정이나 서버에는 저장하지 않습니다.
              저장 정보 지우기를 누르거나 브라우저 저장소를 지울 때까지 남아 있습니다.
            </p>
            <button type="button" onClick={clearStoredProfile} disabled={disabled}>
              저장 정보 지우기
            </button>
          </div>
          {!profileValid ? (
            <p
              className={`${styles.brandProfileStatus} ${styles.brandProfileWide}`}
              role="alert"
            >
              웹사이트는 http:// 또는 https://로 시작하는 전체 주소를 입력해 주세요.
            </p>
          ) : null}
          {storageMessage ? (
            <p
              className={`${styles.brandProfileStatus} ${styles.brandProfileWide}`}
              role="status"
            >
              {storageMessage}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
