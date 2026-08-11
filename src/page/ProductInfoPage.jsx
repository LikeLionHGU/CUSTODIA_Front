import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";

const PRODUCT_TYPE_OPTIONS = ["가방", "지갑", "벨트", "신발", "소품", "기타"];
const PURCHASE_PLACE_OPTIONS = ["MCM 공식매장", "백화점", "면세점", "온라인스토어", "기타"];
const DAMAGE_TYPE_OPTIONS = ["찍힘", "긁힘", "변색", "금속부품손상", "봉제손상", "기타"];

const MAX_PHOTOS = 3;

const PRODUCT_FIELDS = [
  { key: "warrantyNumber", label: "보증서 번호 (밑에 정보 자동 입력)", type: "text" },
  { key: "productType", label: "제품 종류", type: "select", options: PRODUCT_TYPE_OPTIONS },
  { key: "modelName", label: "제품 모델명", type: "text" },
  { key: "purchaseDate", label: "구매 날짜", type: "date" },
  { key: "purchasePlace", label: "구매처", type: "select", options: PURCHASE_PLACE_OPTIONS },
];

const DAMAGE_FIELDS = [
  { key: "damagePart", label: "손상 부위", type: "text" },
  { key: "damageType", label: "손상 유형", type: "select", options: DAMAGE_TYPE_OPTIONS },
  { key: "damageDesc", label: "손상 경위 및 상태 설명", type: "area" },
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
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  box-sizing: border-box;
  text-align: left;
`;

const Spacer = styled.div`
  flex: 1 0 0;
`;

const BodyRow = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-start;
`;

const Body = styled.div`
  flex: 1 0 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  padding: 24px;
  box-sizing: border-box;
`;

const TopBar = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`;

const StepLabel = styled.p`
  margin: 0;
  font-size: 11px;
  color: #1f2937;
  white-space: nowrap;
`;

const SectionTitle = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  font-size: 14px;
  cursor: pointer;

  ${(props) =>
    props.$variant === "link"
      ? css`
          padding: 0;
          border: none;
          background: none;
          color: #6b7280;
          text-decoration: underline;
          font-weight: 400;
        `
      : props.$variant === "secondary"
        ? css`
            padding: 8px 16px;
            border-radius: 6px;
            border: 1px solid #1f2937;
            background: #fff;
            color: #1f2937;
            font-weight: 500;
          `
        : css`
            padding: 8px 16px;
            border-radius: 6px;
            border: none;
            background: #1f2937;
            color: #fff;
            font-weight: 500;
          `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Columns = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 480px);
  align-items: start;
  gap: 24px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const LeftColumn = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const RightColumn = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Card = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
`;

const CardTitle = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
`;

const FieldGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FieldLabel = styled.label`
  font-size: 14px;
  color: #1f2937;
`;

const TextInput = styled.input`
  width: 100%;
  height: 38px;
  box-sizing: border-box;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #fff;
  font-size: 14px;
  color: #1f2937;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 80px;
  box-sizing: border-box;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #fff;
  font-size: 14px;
  color: #1f2937;
  resize: vertical;
`;

const SelectWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Select = styled.select`
  width: 100%;
  height: 38px;
  box-sizing: border-box;
  padding: 8px 32px 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #fff;
  font-size: 14px;
  color: ${(props) => (props.$hasValue ? "#1f2937" : "#9ca3af")};
  appearance: none;
`;

const ChevronWrap = styled.span`
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  display: flex;
  pointer-events: none;
`;

const UploadNote = styled.p`
  margin: 0;
  font-size: 12px;
  color: #1f2937;
`;

const UploadRow = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`;

const PhotoGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`;

const PhotoSlot = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 6px;
  overflow: hidden;
  font-size: 11px;
  color: #9ca3af;
  text-align: center;
`;

const PhotoImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemovePhotoButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: rgba(31, 41, 55, 0.7);
  color: #fff;
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const InfoTitle = styled.p`
  margin: 0;
  font-size: 12px;
  color: #1f2937;
`;

const InfoText = styled.p`
  margin: 0;
  font-size: 11px;
  color: #1f2937;
`;

const BottomRow = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
`;

function ChevronIcon() {
  return (
    <ChevronWrap>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M3 4.5L6 7.5L9 4.5"
          stroke="#6B7280"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </ChevronWrap>
  );
}

function FormField({ label, type, options, value, onChange, max }) {
  return (
    <FieldGroup>
      <FieldLabel>{label}</FieldLabel>
      {type === "text" && <TextInput type="text" value={value} onChange={onChange} />}
      {type === "date" && <TextInput type="date" value={value} onChange={onChange} max={max} />}
      {type === "area" && <TextArea value={value} onChange={onChange} />}
      {type === "select" && (
        <SelectWrapper>
          <Select value={value} onChange={onChange} $hasValue={!!value}>
            <option value="" disabled hidden>
              선택
            </option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
          <ChevronIcon />
        </SelectWrapper>
      )}
    </FieldGroup>
  );
}

export default function ProductInfoPage() {
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
      <BodyRow>
        <Body>
          <TopBar>
            <Button type="button" $variant="link" onClick={() => navigate("/as-start")}>
              AS 접수 시작으로
            </Button>
            <Spacer />
            <StepLabel>2단계 / 3단계 — 제품 정보 입력</StepLabel>
          </TopBar>

          <SectionTitle>제품 정보 입력</SectionTitle>

          <Columns>
            <LeftColumn>
              <Card>
                <CardTitle>제품 정보</CardTitle>
                {PRODUCT_FIELDS.map((field) => (
                  <FormField
                    key={field.key}
                    label={field.label}
                    type={field.type}
                    options={field.options}
                    value={formData[field.key]}
                    onChange={handleFieldChange(field.key)}
                    max={field.type === "date" ? todayDateString : undefined}
                  />
                ))}
              </Card>

              <Card>
                <CardTitle>손상 설명</CardTitle>
                {DAMAGE_FIELDS.map((field) => (
                  <FormField
                    key={field.key}
                    label={field.label}
                    type={field.type}
                    options={field.options}
                    value={formData[field.key]}
                    onChange={handleFieldChange(field.key)}
                  />
                ))}
              </Card>
            </LeftColumn>

            <RightColumn>
              <Card>
                <CardTitle>손상 사진 업로드</CardTitle>
                <UploadNote>
                  전체 제품 사진 1장과 손상 부위 사진을 최소 1장 이상 첨부해 주세요. 선명한 사진일수록 견적 정확도가
                  높아집니다. (최대 {MAX_PHOTOS}장)
                </UploadNote>
                <PhotoGrid>
                  {photos.map((photo) => (
                    <PhotoSlot key={photo.id}>
                      <PhotoImg src={photo.url} alt="손상 사진" />
                      <RemovePhotoButton type="button" onClick={() => handleRemovePhoto(photo.id)}>
                        ×
                      </RemovePhotoButton>
                    </PhotoSlot>
                  ))}
                  {photos.length === 0 && <PhotoSlot>업로드된 사진 없음</PhotoSlot>}
                </PhotoGrid>
                <UploadRow>
                  <Button
                    type="button"
                    $variant="secondary"
                    onClick={handleAddPhotoClick}
                    disabled={photos.length >= MAX_PHOTOS}
                  >
                    사진 추가 ({photos.length}/{MAX_PHOTOS})
                  </Button>
                  <Button type="button" $variant="link">
                    추가 사진 요청 안내 확인
                  </Button>
                </UploadRow>
                <HiddenFileInput
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                />
              </Card>

              <Card>
                <InfoTitle>예상 견적 안내</InfoTitle>
                <InfoText>제출하신 사진과 정보를 바탕으로 AI가 예상 수선 비용 범위를 안내합니다.</InfoText>
                <InfoText>예상 금액은 참고용이며, 실물 진단 후 최종 견적이 달라질 수 있습니다.</InfoText>
              </Card>
            </RightColumn>
          </Columns>

          <BottomRow>
            <Button type="button" $variant="secondary">
              임시 저장
            </Button>
            <Button type="button">예상 견적 확인하기</Button>
          </BottomRow>
        </Body>
      </BodyRow>
    </Page>
  );
}
