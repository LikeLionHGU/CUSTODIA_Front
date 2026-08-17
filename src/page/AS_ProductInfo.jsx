import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Button from "../components/Button";

const PRODUCT_TYPE_OPTIONS = ["가방", "지갑", "벨트", "신발", "소품", "기타"];
const PURCHASE_PLACE_OPTIONS = ["MCM 공식매장", "백화점", "면세점", "온라인스토어", "기타"];
const DAMAGE_TYPE_OPTIONS = ["찍힘", "긁힘", "변색", "금속부품손상", "봉제손상", "기타"];

const MAX_PHOTOS = 3;

const PRODUCT_FIELDS = [
  {
    key: "warrantyNumber",
    label: "보증서 번호",
    type: "text",
    placeholder: "보증서 번호 입력 시 아래 정보가 자동 입력됩니다.",
    full: true,
  },
  { key: "productType", label: "제품 종류", type: "select", options: PRODUCT_TYPE_OPTIONS },
  { key: "modelName", label: "제품 모델명", type: "text", placeholder: "모델명" },
  { key: "purchaseDate", label: "구매 날짜", type: "date" },
  { key: "purchasePlace", label: "구매처", type: "select", options: PURCHASE_PLACE_OPTIONS },
];

const DAMAGE_FIELDS = [
  {
    key: "damagePart",
    label: "손상 부위",
    type: "text",
    placeholder: "예: 핸들, 지퍼, 스트랩...",
    full: true,
  },
  {
    key: "damageType",
    label: "손상 유형",
    type: "select",
    options: DAMAGE_TYPE_OPTIONS,
    full: true,
  },
  {
    key: "damageDesc",
    label: "손상 경위 및 상태 설명",
    type: "area",
    placeholder: "손상이 발생한 경위와 현재 상태를 자세히 기술해 주세요.",
    full: true,
  },
];

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const Page = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: #f9f9f9;
  box-sizing: border-box;
  text-align: left;
`;

const Body = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  padding: 40px 48px 72px;
  box-sizing: border-box;

  @media (max-width: 640px) {
    padding: 28px 18px 48px;
  }
`;

const TitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const BackLink = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  color: #6f6667;
  font-size: 12px;
  line-height: 1;
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #000;
`;

const Columns = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 420px);
  align-items: start;
  gap: 48px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const Column = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Card = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  background: #fff;
  border: 1px solid #e5e2e2;
  border-radius: 4px;
`;

const CardTitle = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #000;
`;

const FieldGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 16px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const FieldGroup = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  grid-column: ${(props) => (props.$full ? "1 / -1" : "auto")};
`;

const FieldLabel = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: #222;
`;

const fieldBox = `
  width: 100%;
  box-sizing: border-box;
  padding: 0 14px;
  border: 1px solid #dcd8d8;
  border-radius: 2px;
  background: #fff;
  font-size: 13px;
  color: #222;

  &::placeholder {
    color: #b5aeae;
  }

  &:focus {
    border-color: #3a2526;
  }
`;

const TextInput = styled.input`
  ${fieldBox}
  height: 44px;
`;

const TextArea = styled.textarea`
  ${fieldBox}
  height: 108px;
  padding: 13px 14px;
  line-height: 1.6;
  resize: vertical;
`;

const SelectWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Select = styled.select`
  ${fieldBox}
  height: 44px;
  padding-right: 38px;
  color: ${(props) => (props.$hasValue ? "#222" : "#b5aeae")};
  appearance: none;
  cursor: pointer;
`;

const ChevronWrap = styled.span`
  position: absolute;
  top: 50%;
  right: 14px;
  transform: translateY(-50%);
  display: flex;
  pointer-events: none;
`;

const UploadNote = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.7;
  color: #6f6667;
`;

const PhotoRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 10px;
`;

const photoSlot = `
  position: relative;
  flex-shrink: 0;
  width: 92px;
  height: 92px;
  box-sizing: border-box;
  border-radius: 2px;
  overflow: hidden;
`;

const AddPhotoButton = styled.button`
  ${photoSlot}
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0;
  border: 1px dashed #cdc7c7;
  background: #fbfafa;
  color: #8c8484;

  &:hover:not(:disabled) {
    border-color: #3a2526;
    color: #3a2526;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const PhotoCount = styled.span`
  font-size: 10px;
  letter-spacing: 0.5px;
`;

const PhotoSlot = styled.div`
  ${photoSlot}
  border: 1px solid #e5e2e2;
`;

const PhotoImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemovePhotoButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  width: 18px;
  height: 18px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(32, 18, 19, 0.72);
  color: #fff;
  font-size: 11px;
  line-height: 1;

  &:hover {
    background: rgba(32, 18, 19, 0.92);
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const TextLink = styled.button`
  align-self: flex-start;
  padding: 0;
  color: #6f6667;
  font-size: 12px;
  text-decoration: underline;
  text-underline-offset: 3px;

  &:hover {
    color: #222;
  }
`;

const NoticeBox = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  background: #3a2526;
  border-radius: 4px;
`;

const NoticeTitle = styled.p`
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
`;

const NoticeBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-left: 24px;
`;

const NoticeText = styled.p`
  margin: 0;
  color: #d8cccd;
  font-size: 12px;
  line-height: 1.6;
`;

const BottomRow = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
`;

function BackChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7.5 2.5L4 6L7.5 9.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SelectChevronIcon() {
  return (
    <ChevronWrap>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M3 4.5L6 7.5L9 4.5"
          stroke="#6F6667"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </ChevronWrap>
  );
}

function CameraIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 8.5C3 7.67 3.67 7 4.5 7h2.2c.5 0 .97-.25 1.25-.67l.6-.9c.28-.42.75-.68 1.25-.68h4.4c.5 0 .97.26 1.25.68l.6.9c.28.42.75.67 1.25.67h2.2c.83 0 1.5.67 1.5 1.5v9c0 .83-.67 1.5-1.5 1.5h-15c-.83 0-1.5-.67-1.5-1.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12.5" r="3.2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="6.4" stroke="#fff" strokeWidth="1.1" />
      <path d="M8 7.2v4" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="5" r="0.8" fill="#fff" />
    </svg>
  );
}

function FormField({ label, type, options, placeholder, value, onChange, max, full }) {
  const fieldId = `field-${label}`;

  return (
    <FieldGroup $full={full}>
      <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
      {type === "text" && (
        <TextInput id={fieldId} type="text" placeholder={placeholder} value={value} onChange={onChange} />
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
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
          <SelectChevronIcon />
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
    warrantyNumber: "",
    productType: "",
    modelName: "",
    purchaseDate: "",
    purchasePlace: "",
    damagePart: "",
    damageType: "",
    damageDesc: "",
  });
  const [photos, setPhotos] = useState([]);

  const handleFieldChange = (key) => (e) => {
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleAddPhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setPhotos((prev) => {
      const remainingSlots = MAX_PHOTOS - prev.length;
      const newPhotos = files.slice(0, remainingSlots).map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        url: URL.createObjectURL(file),
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

  return (
    <Page>
      <Body>
        <TitleGroup>
          <BackLink type="button" onClick={() => navigate("/")}>
            <BackChevronIcon />
            홈화면으로
          </BackLink>
          <PageTitle>제품 정보 입력</PageTitle>
        </TitleGroup>

        <Columns>
          <Column>
            <Card>
              <CardTitle>제품 정보</CardTitle>
              <FieldGrid>
                {PRODUCT_FIELDS.map((field) => (
                  <FormField
                    key={field.key}
                    label={field.label}
                    type={field.type}
                    options={field.options}
                    placeholder={field.placeholder}
                    full={field.full}
                    value={formData[field.key]}
                    onChange={handleFieldChange(field.key)}
                    max={field.type === "date" ? todayDateString : undefined}
                  />
                ))}
              </FieldGrid>
            </Card>

            <Card>
              <CardTitle>손상 설명</CardTitle>
              <FieldGrid>
                {DAMAGE_FIELDS.map((field) => (
                  <FormField
                    key={field.key}
                    label={field.label}
                    type={field.type}
                    options={field.options}
                    placeholder={field.placeholder}
                    full={field.full}
                    value={formData[field.key]}
                    onChange={handleFieldChange(field.key)}
                  />
                ))}
              </FieldGrid>
            </Card>
          </Column>

          <Column>
            <Card>
              <CardTitle>손상 사진 업로드</CardTitle>
              <UploadNote>
                전체 제품 사진 1장과 손상 부위 사진을 최소 1장 이상 첨부해 주세요.
              </UploadNote>

              <PhotoRow>
                <AddPhotoButton
                  type="button"
                  onClick={handleAddPhotoClick}
                  disabled={photos.length >= MAX_PHOTOS}
                  aria-label="사진 추가"
                >
                  <CameraIcon />
                  <PhotoCount>
                    {photos.length}/{MAX_PHOTOS}
                  </PhotoCount>
                </AddPhotoButton>

                {photos.map((photo) => (
                  <PhotoSlot key={photo.id}>
                    <PhotoImg src={photo.url} alt="손상 사진" />
                    <RemovePhotoButton
                      type="button"
                      onClick={() => handleRemovePhoto(photo.id)}
                      aria-label="사진 삭제"
                    >
                      ×
                    </RemovePhotoButton>
                  </PhotoSlot>
                ))}
              </PhotoRow>

              <TextLink type="button">추가 사진 요청 안내 확인</TextLink>

              <HiddenFileInput
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />
            </Card>

            <NoticeBox>
              <NoticeTitle>
                <InfoIcon />
                예상 견적 안내
              </NoticeTitle>
              <NoticeBody>
                <NoticeText>
                  제출하신 사진과 정보를 바탕으로 AI가 예상 수선 비용 범위를 안내합니다.
                </NoticeText>
                <NoticeText>
                  예상 금액은 참고용이며, 실물 진단 후 최종 견적이 달라질 수 있습니다.
                </NoticeText>
              </NoticeBody>
            </NoticeBox>
          </Column>
        </Columns>

        <BottomRow>
          <Button type="button" variant="stroke">
            임시 저장
          </Button>
          <Button
            type="button"
            variant="filled"
            onClick={() => navigate("/ai-estimate", { state: { formData, photos } })}
          >
            예상 견적 확인하기
          </Button>
        </BottomRow>
      </Body>
    </Page>
  );
}
