import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Button from "../components/Button";
import StepIndicator from "../components/StepIndicator";
import * as asCase from "../api/asCase";
import * as product from "../api/product";
import { useApiQuery } from "../api/useApiQuery";
import { toErrorMessage } from "../api/format";
import backArrow from "../assets/icon_back_arrow.svg";
import chevronDown from "../assets/icon_chevron_down.svg";
import calendarIcon from "../assets/icon_calendar.svg";
import cameraIcon from "../assets/icon_camera_small.svg";
import removeIcon from "../assets/icon_remove.svg";
import infoIcon from "../assets/icon_info.svg";

// 명세 3-2: images 는 1~4장. 5장 이상이면 400 TOO_MANY_PHOTOS
// 종류 조합도 강제된다 — PRODUCT 1장 이상 + DAMAGE 1장 이상 (400 PHOTO_TYPE_REQUIRED)
const MAX_PHOTOS = 4;

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
    label: "손상 경위 및 상태 설명",
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

function FormField({ label, type, options, placeholder, value, onChange, onBlur, max, full }) {
  const fieldId = `field-${label}`;

  return (
    <FieldGroup $full={full}>
      <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
      {type === "text" && (
        <TextInput
          id={fieldId}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
        />
      )}
      {type === "date" && (
        <TextInput id={fieldId} type="date" value={value} onChange={onChange} max={max} />
      )}
      {type === "area" && (
        <TextArea id={fieldId} placeholder={placeholder} value={value} onChange={onChange} />
      )}
      {type === "select" && (
        <SelectWrapper>
          <Select id={fieldId} value={value} onChange={onChange} $hasValue={!!value}>
            <option value="" disabled hidden>
              선택
            </option>
            {(options ?? []).map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
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

    // 첫 장이 PRODUCT 로 나가므로 최소 2장이어야 조합 제약을 만족한다
    if (photos.length < 2) {
      setSubmitError("전체 제품 사진 1장과 손상 부위 사진을 최소 1장 이상 첨부해 주세요.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      // photoTypeList 는 images 순서와 1:1 대응 — 첫 장을 제품 사진으로 본다
      const request = {
        ...formData,
        warrantyNo: formData.warrantyNo.trim() || null,
        photoTypeList: photos.map((_, index) => (index === 0 ? "PRODUCT" : "DAMAGE")),
      };
      const { asNo } = await asCase.create(request, photos.map((photo) => photo.file));
      navigate("/ai-estimate", { state: { asNo } });
    } catch (err) {
      // 명세 3-2: 분석 실패(502)여도 접수는 저장되므로 asNo 를 들고 견적 화면으로 보낸다
      const failedAsNo = err.body?.asNo;
      if (failedAsNo) {
        navigate("/ai-estimate", { state: { asNo: failedAsNo } });
        return;
      }
      setSubmitError(toErrorMessage(err, "접수에 실패했습니다. 잠시 후 다시 시도해 주세요."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page>
      <Body>
        <BackLink type="button" onClick={() => navigate("/")}>
          <BackArrow src={backArrow} alt="" />
          홈화면으로
        </BackLink>

        <TopRow>
          <TopLeft>
            <PageTitle>제품 정보 입력</PageTitle>
            <StepIndicator current={1} />
          </TopLeft>
          <Button type="button" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "접수 중…" : "예상 견적 확인하기"}
          </Button>
        </TopRow>

        <Columns>
          <LeftColumn>
            <Card>
              <CardHeader>
                <CardHeaderInner>제품 정보</CardHeaderInner>
              </CardHeader>
              <CardBody>
                <FieldGrid>
                  {PRODUCT_FIELDS.map((field) => (
                    <FormField
                      key={field.key}
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
                <CardHeaderInner>손상 설명</CardHeaderInner>
              </CardHeader>
              <CardBody>
                <FieldGrid>
                  {DAMAGE_FIELDS.map((field) => (
                    <FormField
                      key={field.key}
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
              <UploadHeader>손상 사진 업로드</UploadHeader>
              <UploadBody>
                <UploadNote>
                  전체 제품 사진 1장과 손상 부위 사진을 최소 1장 이상 첨부해 주세요.
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
                      <PhotoImg src={photo.url} alt="손상 사진" />
                      <RemoveButton
                        type="button"
                        onClick={() => handleRemovePhoto(photo.id)}
                        aria-label="사진 삭제"
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

                <UploadGuideLink type="button">추가 사진 요청 안내 확인</UploadGuideLink>
              </UploadBody>
            </Card>

            <InfoPanel>
              <InfoIcon src={infoIcon} alt="" />
              <InfoBody>
                <InfoTitle>예상 견적 안내</InfoTitle>
                <InfoList>
                  {ESTIMATE_NOTES.map((note) => (
                    <InfoListItem key={note}>{note}</InfoListItem>
                  ))}
                </InfoList>
              </InfoBody>
            </InfoPanel>
          </RightColumn>
        </Columns>

        {(submitError || formError) && (
          <SubmitError role="alert">{submitError || toErrorMessage(formError)}</SubmitError>
        )}
      </Body>
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

const TopRow = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 38px;
`;

const TopLeft = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 155px;

  @media (max-width: 1200px) {
    gap: 32px;
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
  border-radius: 8px;
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

const fieldBox = `
  width: 100%;
  box-sizing: border-box;
  padding: 14px 12px;
  background: #fff;
  border: 1px solid #c4c4c4;
  border-radius: 4px;
  font-size: 12px;
  line-height: 12px;
  color: #222;
  font-family: inherit;

  &::placeholder {
    color: #919191;
  }
`;

const TextInput = styled.input`
  ${fieldBox}

  /* type="date" 의 브라우저 기본 아이콘을 캘린더 아이콘으로 교체한다.
     클릭 시 네이티브 날짜 선택기는 그대로 열린다. */
  &::-webkit-calendar-picker-indicator {
    width: 18px;
    height: 18px;
    /* data URI 안에 작은따옴표가 들어가므로 큰따옴표로 감싸야 파싱된다 */
    background: url("${calendarIcon}") center / contain no-repeat;
    cursor: pointer;
  }
`;

const TextArea = styled.textarea`
  ${fieldBox}
  height: 100px;
  line-height: 18px;
  resize: vertical;
`;

const SelectWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Select = styled.select`
  ${fieldBox}
  padding-right: 34px;
  appearance: none;
  color: ${(props) => (props.$hasValue ? "#222" : "#919191")};
`;

const SelectChevron = styled.img`
  position: absolute;
  top: 50%;
  right: 12px;
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
  color: #6b6b65;
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
  border-radius: 12px;
  cursor: pointer;

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
  border-radius: 12px;
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
  border-radius: 999px;
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
  border-radius: 8px;
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
