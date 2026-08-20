import { useEffect, useRef, useState } from "react";
import { useBlocker, useNavigate } from "react-router-dom";
import styled from "styled-components";
import Button from "../components/Button";
import StepIndicator from "../components/StepIndicator";
import ConfirmLeaveModal from "../components/ConfirmLeaveModal";
import * as asCase from "../api/asCase";
import * as product from "../api/product";
import { useApiQuery } from "../api/useApiQuery";
import { toErrorMessage } from "../api/format";
import { useT } from "../i18n";
import backArrow from "../assets/icon_back_arrow.svg";
import chevronDown from "../assets/icon_chevron_down.svg";
import calendarIcon from "../assets/icon_calendar.svg";
import cameraIcon from "../assets/icon_camera_small.svg";
import removeIcon from "../assets/icon_remove.svg";
import infoIcon from "../assets/icon_info.svg";

// 명세 3-2: images 는 1~4장. 5장 이상이면 400 TOO_MANY_PHOTOS
const MAX_PHOTOS = 4;
const MIN_PHOTOS = 1;

const PRODUCT_FIELDS = [
  {
    key: "warrantyNo",
    label: "보증서 번호",
    type: "text",
    placeholder: "보증서 번호 입력 시 아래 정보가 자동 입력됩니다.",
    full: true,
  },
  { key: "productType", label: "제품 종류", type: "select", optionKey: "productTypeList" },
  { key: "modelName", label: "제품 모델명", type: "text", placeholder: "모델명" },
  { key: "purchasedAt", label: "구매 날짜", type: "date" },
  { key: "purchaseChannel", label: "구매처", type: "select", optionKey: "purchaseChannelList" },
];

const DAMAGE_FIELDS = [
  {
    key: "damagePart",
    label: "손상 부위",
    type: "text",
    placeholder: "예: 핸들, 지퍼, 스트랩...",
    full: true,
  },
  { key: "damageType", label: "손상 유형", type: "select", optionKey: "damageTypeList", full: true },
  {
    key: "damageDescription",
    label: "손상 경위 및 상태 설명 (선택)",
    type: "area",
    placeholder: "손상이 발생한 경위와 현재 상태를 자세히 기술해 주세요.",
    full: true,
  },
];

const ESTIMATE_NOTES = [
  "제출하신 사진과 정보를 바탕으로 AI가 예상 수선 비용 범위를 안내합니다.",
  "예상 금액은 참고용이며, 실물 진단 후 최종 견적이 달라질 수 있습니다.",
];

function getTodayDateString() {
  const today = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
}

function FormField({ name, label, type, options, placeholder, value, onChange, onBlur, max, full }) {
  const t = useT();
  // 언어가 바뀌어도 id 가 흔들리지 않도록 라벨 대신 필드 키를 쓴다
  const fieldId = `field-${name}`;

  return (
    <FieldGroup $full={full}>
      <FieldLabel htmlFor={fieldId}>{t(label)}</FieldLabel>
      {type === "text" && (
        <TextInput
          id={fieldId}
          type="text"
          placeholder={t(placeholder)}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
        />
      )}
      {type === "date" && (
        <TextInput id={fieldId} type="date" value={value} onChange={onChange} max={max} />
      )}
      {type === "area" && (
        <TextArea id={fieldId} placeholder={t(placeholder)} value={value} onChange={onChange} />
      )}
      {type === "select" && (
        <SelectWrapper>
          <Select id={fieldId} value={value} onChange={onChange} $hasValue={!!value}>
            <option value="" disabled hidden>
              {t("선택")}
            </option>
            {(options ?? []).map((option) => (
              <option key={option.code} value={option.code}>
                {t(option.label)}
              </option>
            ))}
          </Select>
          <SelectChevron src={chevronDown} alt="" />
        </SelectWrapper>
      )}
    </FieldGroup>
  );
}

export default function AS_ProductInfo() {
  const navigate = useNavigate();
  const t = useT();
  const fileInputRef = useRef(null);
  const todayDateString = getTodayDateString();

  const [formData, setFormData] = useState({
    warrantyNo: "",
    productType: "",
    modelName: "",
    purchasedAt: "",
    purchaseChannel: "",
    damagePart: "",
    damageType: "",
    damageDescription: "",
  });
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // 사진 장수가 모자란 채 제출을 눌렀을 때, 업로드 카드의 안내 문구를 붉게 표시한다.
  // 사진을 추가하면 다시 원래 색으로 돌아간다.
  const [photoWarning, setPhotoWarning] = useState(false);

  /**
   * 접수 내용은 "예상 견적 확인하기" 를 누를 때만 서버로 올라간다.
   * 중간 저장이 없으므로, 뭔가 입력한 상태로 화면을 벗어나면 입력값은 사라진다.
   * 그래서 한 번 확인을 받는다.
   */
  const isDirty = Object.values(formData).some((value) => value.trim() !== "") || photos.length > 0;

  // 접수가 성공해 견적 화면으로 넘어갈 때는 막지 않는다.
  // navigate 직전에 세워야 하므로 state 대신 ref 를 쓴다 (state 는 다음 렌더에나 반영된다).
  const bypassLeaveGuardRef = useRef(false);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty &&
      !bypassLeaveGuardRef.current &&
      currentLocation.pathname !== nextLocation.pathname,
  );

  // 새로고침·탭 닫기는 라우터가 잡지 못하므로 브라우저 기본 경고를 쓴다.
  // (문구는 브라우저가 정하며 바꿀 수 없다)
  useEffect(() => {
    if (!isDirty) return undefined;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // 명세 3-1: 셀렉트 옵션 목록
  const { data: form, error: formError } = useApiQuery(() => asCase.getForm(), []);

  const handleFieldChange = (key) => (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (key === "warrantyNo") setSubmitError(null);
  };

  /**
   * 명세 2-1: 보증서 번호로 제품 정보를 자동 채운다.
   * 404면 자동 채움만 생략하고 접수는 계속 진행한다. 구매처는 자동 채움 대상이 아니다.
   */
  const handleWarrantyBlur = async () => {
    const warrantyNo = formData.warrantyNo.trim();
    if (!warrantyNo) return;

    try {
      const detail = await product.getByWarrantyNo(warrantyNo);
      setFormData((prev) => ({
        ...prev,
        productType: detail.productType ?? prev.productType,
        modelName: detail.modelName ?? prev.modelName,
        purchasedAt: detail.purchasedAt ?? prev.purchasedAt,
      }));
    } catch {
      // 보증서가 없으면 조용히 넘어간다
    }
  };

  const handleAddPhotoClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setPhotos((prev) => {
      const remainingSlots = MAX_PHOTOS - prev.length;
      const newPhotos = files.slice(0, remainingSlots).map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        url: URL.createObjectURL(file),
        file, // POST /asCase 의 images 파트로 그대로 올린다
      }));
      return [...prev, ...newPhotos];
    });

    setPhotoWarning(false);
    e.target.value = "";
  };

  const handleRemovePhoto = (id) => {
    setPhotos((prev) => {
      const target = prev.find((photo) => photo.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((photo) => photo.id !== id);
    });
  };

  const handleSubmit = async () => {
    if (submitting) return;

    if (photos.length < MIN_PHOTOS) {
      // 같은 문구가 업로드 카드에 이미 있으므로 하단에 또 띄우지 않고 그 문구를 강조한다
      setPhotoWarning(true);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      // photoTypeList 는 images 순서와 1:1 대응 — 첫 장을 제품 사진으로 본다
      const request = {
        ...formData,
        warrantyNo: formData.warrantyNo.trim() || null,
        // 선택 항목이라 비어 있으면 빈 문자열 대신 null 로 보낸다
        damageDescription: formData.damageDescription.trim() || null,
        photoTypeList: photos.map((_, index) => (index === 0 ? "PRODUCT" : "DAMAGE")),
      };
      const { asNo } = await asCase.create(request, photos.map((photo) => photo.file));
      bypassLeaveGuardRef.current = true;
      navigate("/ai-estimate", { state: { asNo } });
    } catch (err) {
      // 명세 3-2: 분석 실패(502)여도 접수는 저장되므로 asNo 를 들고 견적 화면으로 보낸다
      const failedAsNo = err.body?.asNo;
      if (failedAsNo) {
        bypassLeaveGuardRef.current = true;
        navigate("/ai-estimate", { state: { asNo: failedAsNo } });
        return;
      }
      setSubmitError(
        err.code === "PHOTO_TYPE_REQUIRED"
          ? t("전체 제품 사진과 손상 부위 사진을 각각 1장 이상 첨부해 주세요.")
          : t(toErrorMessage(err, "접수에 실패했습니다. 잠시 후 다시 시도해 주세요.")),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page>
      <Body>
        <BackLink type="button" onClick={() => navigate("/")}>
          <BackArrow src={backArrow} alt="" />
          {t("홈화면으로")}
        </BackLink>

        <TopRow>
          <PageTitle>{t("제품 정보 입력")}</PageTitle>
          <StepWrap>
            <StepIndicator current={1} />
          </StepWrap>
          <TopActions>
            <Button type="button" onClick={handleSubmit} disabled={submitting}>
              {submitting ? t("접수 중…") : t("예상 견적 확인하기")}
            </Button>
          </TopActions>
        </TopRow>

        <Columns>
          <LeftColumn>
            <Card>
              <CardHeader>
                <CardHeaderInner>{t("제품 정보")}</CardHeaderInner>
              </CardHeader>
              <CardBody>
                <FieldGrid>
                  {PRODUCT_FIELDS.map((field) => (
                    <FormField
                      key={field.key}
                      name={field.key}
                      label={field.label}
                      type={field.type}
                      options={field.optionKey ? form?.[field.optionKey] : undefined}
                      placeholder={field.placeholder}
                      full={field.full}
                      value={formData[field.key]}
                      onChange={handleFieldChange(field.key)}
                      onBlur={field.key === "warrantyNo" ? handleWarrantyBlur : undefined}
                      max={field.type === "date" ? todayDateString : undefined}
                    />
                  ))}
                </FieldGrid>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardHeaderInner>{t("손상 설명")}</CardHeaderInner>
              </CardHeader>
              <CardBody>
                <FieldGrid>
                  {DAMAGE_FIELDS.map((field) => (
                    <FormField
                      key={field.key}
                      name={field.key}
                      label={field.label}
                      type={field.type}
                      options={field.optionKey ? form?.[field.optionKey] : undefined}
                      placeholder={field.placeholder}
                      full={field.full}
                      value={formData[field.key]}
                      onChange={handleFieldChange(field.key)}
                    />
                  ))}
                </FieldGrid>
              </CardBody>
            </Card>
          </LeftColumn>

          <RightColumn>
            <Card>
              <UploadHeader>{t("손상 사진 업로드")}</UploadHeader>
              <UploadBody>
                <UploadNote $warn={photoWarning} role={photoWarning ? "alert" : undefined}>
                  {t("제품 사진을 최소 1장, 최대 {max}장까지 첨부할 수 있습니다.", {
                    max: MAX_PHOTOS,
                  })}
                </UploadNote>

                <PhotoRow>
                  <UploadTile
                    type="button"
                    onClick={handleAddPhotoClick}
                    disabled={photos.length >= MAX_PHOTOS}
                  >
                    <UploadTileIcon src={cameraIcon} alt="" />
                    <UploadTileCount>
                      {photos.length}/{MAX_PHOTOS}
                    </UploadTileCount>
                  </UploadTile>

                  {photos.map((photo) => (
                    <PhotoTile key={photo.id}>
                      <PhotoImg src={photo.url} alt={t("손상 사진")} />
                      <RemoveButton
                        type="button"
                        onClick={() => handleRemovePhoto(photo.id)}
                        aria-label={t("사진 삭제")}
                      >
                        <RemoveIcon src={removeIcon} alt="" />
                      </RemoveButton>
                    </PhotoTile>
                  ))}
                </PhotoRow>

                <HiddenFileInput
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                />

                <UploadGuideLink type="button">{t("추가 사진 요청 안내 확인")}</UploadGuideLink>
              </UploadBody>
            </Card>

            <InfoPanel>
              <InfoIcon src={infoIcon} alt="" />
              <InfoBody>
                <InfoTitle>{t("예상 견적 안내")}</InfoTitle>
                <InfoList>
                  {ESTIMATE_NOTES.map((note) => (
                    <InfoListItem key={note}>{t(note)}</InfoListItem>
                  ))}
                </InfoList>
              </InfoBody>
            </InfoPanel>
          </RightColumn>
        </Columns>

        {(submitError || formError) && (
          <SubmitError role="alert">{submitError || t(toErrorMessage(formError))}</SubmitError>
        )}
      </Body>

      <ConfirmLeaveModal
        open={blocker.state === "blocked"}
        onStay={() => blocker.reset()}
        onLeave={() => blocker.proceed()}
      />
    </Page>
  );
}

const Page = styled.div`
  width: 100%;
  min-height: 100%;
  background: #f9f9f9;
  box-sizing: border-box;
  text-align: left;
`;

const Body = styled.div`
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 27px 48px 60px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`;

const BackLink = styled.button`
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 23px;
  padding: 0;
  border: none;
  background: none;
  font-size: 10px;
  line-height: 10px;
  color: #919191;
  text-transform: uppercase;
  cursor: pointer;
`;

const BackArrow = styled.img`
  width: 8px;
  height: 4px;
  transform: rotate(90deg);
`;

/**
 * 제목 · 단계 표시 · 액션 버튼.
 * 양쪽 칸을 같은 1fr 로 두어, 제목과 버튼의 글자 수가 달라져도(언어 전환 포함)
 * 가운데 단계 표시가 화면 중앙에 그대로 머문다.
 */
const TopRow = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 24px;
  margin-bottom: 38px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    justify-items: start;
    gap: 20px;
  }
`;

const StepWrap = styled.div`
  display: flex;
  justify-content: center;
`;

const TopActions = styled.div`
  display: flex;
  justify-content: flex-end;

  @media (max-width: 1200px) {
    justify-content: flex-start;
  }
`;

const PageTitle = styled.p`
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #222;
`;

const Columns = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 797fr) minmax(0, 522fr);
  align-items: start;
  gap: 24.5px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

const LeftColumn = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const RightColumn = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const Card = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  overflow: hidden;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: var(--radius-card);
`;

const CardHeader = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 0 24px;
`;

const CardHeaderInner = styled.p`
  width: 100%;
  margin: 0;
  padding: 20px 0;
  border-bottom: 1px solid #ededed;
  box-sizing: border-box;
  font-size: 14px;
  font-weight: 700;
  line-height: 14px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #222;
`;

const CardBody = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 24px;
`;

const FieldGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 12px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FieldGroup = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  grid-column: ${(props) => (props.$full ? "1 / -1" : "auto")};
`;

const FieldLabel = styled.label`
  font-size: 12px;
  line-height: 12px;
  color: #313131;
`;

/**
 * 텍스트·날짜·셀렉트·textarea 가 공유하는 컨트롤 스타일.
 * 높이(--control-height)·여백·테두리·포커스 링을 여기서만 정하므로
 * 어떤 타입이든 같은 크기와 같은 모서리로 보인다.
 */
const fieldBox = `
  width: 100%;
  min-height: var(--control-height);
  box-sizing: border-box;
  padding: 11px 14px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: var(--radius-control);
  font-size: 12px;
  line-height: 20px;
  color: #222;
  font-family: inherit;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;

  &::placeholder {
    color: #919191;
  }

  &:hover:not(:disabled) {
    border-color: #919191;
  }

  &:focus {
    border-color: #222;
    box-shadow: 0 0 0 3px rgba(34, 34, 34, 0.08);
  }

  &:disabled {
    background: #f0f0f0;
    color: #919191;
    cursor: not-allowed;
  }
`;

const TextInput = styled.input`
  ${fieldBox}
  /* date 는 크롬 내부 높이가 더 커서 min-height 만으로는 2px 어긋난다 — 높이를 고정한다 */
  height: var(--control-height);

  /* type="date" 의 브라우저 기본 아이콘을 캘린더 아이콘으로 교체한다.
     클릭 시 네이티브 날짜 선택기는 그대로 열린다. */
  &::-webkit-calendar-picker-indicator {
    width: 16px;
    height: 16px;
    /* data URI 안에 작은따옴표가 들어가므로 큰따옴표로 감싸야 파싱된다 */
    background: url("${calendarIcon}") center / contain no-repeat;
    cursor: pointer;
  }
`;

const TextArea = styled.textarea`
  ${fieldBox}
  min-height: 112px;
  resize: vertical;
`;

const SelectWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Select = styled.select`
  ${fieldBox}
  height: var(--control-height);
  padding-right: 36px;
  appearance: none;
  color: ${(props) => (props.$hasValue ? "#222" : "#919191")};
`;

const SelectChevron = styled.img`
  position: absolute;
  top: 50%;
  right: 14px;
  width: 10px;
  height: 6px;
  transform: translateY(-50%);
  pointer-events: none;
`;

const UploadHeader = styled.p`
  width: 100%;
  margin: 0;
  padding: 24px 24px 12px;
  box-sizing: border-box;
  font-size: 14px;
  font-weight: 700;
  line-height: 14px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #222;
`;

const UploadBody = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  padding: 8px 24px 24px;
`;

const UploadNote = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 19.5px;
  color: ${(props) => (props.$warn ? "#c0392b" : "#6b6b65")};
  transition: color 0.2s ease;
`;

const PhotoRow = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 8px;
  padding: 20px 0;
  border-top: 1px solid #ededed;
`;

const UploadTile = styled.button`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 88px;
  height: 88px;
  padding: 0;
  background: #f0f0f0;
  border: 1px dashed #919191;
  border-radius: var(--radius-control);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background 0.2s ease;

  &:hover:not(:disabled) {
    border-color: #222;
    background: #ebebeb;
  }

  &:disabled {
    cursor: default;
    opacity: 0.5;
  }
`;

const UploadTileIcon = styled.img`
  width: 20.44px;
  height: 16.36px;
`;

const UploadTileCount = styled.span`
  font-size: 10px;
  line-height: 10px;
  color: #919191;
`;

const PhotoTile = styled.div`
  position: relative;
  flex-shrink: 0;
  width: 88px;
  height: 88px;
  overflow: hidden;
  border-radius: var(--radius-control);
`;

const PhotoImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 6px;
  right: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: var(--radius-pill);
  cursor: pointer;
`;

const RemoveIcon = styled.img`
  width: 8px;
  height: 8px;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const UploadGuideLink = styled.button`
  align-self: center;
  padding: 0;
  border: none;
  background: none;
  font-size: 11px;
  line-height: 16.5px;
  letter-spacing: 0.66px;
  color: #6b6b65;
  text-decoration: underline;
  cursor: pointer;
`;

const InfoPanel = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 24px;
  background: #313131;
  border-radius: var(--radius-card);
`;

const InfoIcon = styled.img`
  flex-shrink: 0;
  width: 15.833px;
  height: 15.833px;
`;

const InfoBody = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

const InfoTitle = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 12px;
  color: #fff;
`;

const InfoList = styled.ul`
  margin: 0;
  padding: 12px 0 0 16.5px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoListItem = styled.li`
  font-size: 11px;
  line-height: 17.875px;
  color: rgba(255, 255, 255, 0.5);
`;

const SubmitError = styled.p`
  width: 100%;
  margin: 16px 0 0;
  font-size: 12px;
  line-height: 18px;
  color: #c0392b;
`;
