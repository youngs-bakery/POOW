import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import Header from "../components/Header";
import iconDropdown from "../assets/images/icon-dropdown.svg";
import iconSMoreVertical from "../assets/images/s-icon-more-vertical.svg";
import iconLeftSlide from "../assets/images/icon-left-slide.svg";
import iconRightSlide from "../assets/images/icon-right-slide.svg";
import symbolLogoGray from "../assets/images/symbol-logo-gray.svg";
import {
  CategoryStyle,
  CategoryInput,
  CategoryLists,
  EmptyMessage,
} from "./SetMood";
import { MoodList, MyMoodStyle } from "../components/MyMood";
import { useSelector, useDispatch } from "react-redux";
import { setMoods } from "../redux/moodSlice";
import { RootState } from "../redux/store";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import BottomSheet from "../components/BottomSheet";
import { useNavigate } from "react-router-dom";

export interface Mood {
  textAreaValue: string;
  fileURLs: string[];
  createdAt: any;
  category: string;
  currentImageIndex: number;
  id: string;
}

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [category, setCategory] = useState<string>("");
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const categoryListRef = useRef<HTMLUListElement>(null);
  const moods = useSelector((state: RootState) => state.moods.moods);
  const [filteredMoods, setFilteredMoods] = useState<Mood[]>([]);
  const userId = useSelector((state: RootState) => state.auth.uid);
  const [isBottomSheet, setIsBottomSheet] = useState<boolean>(false);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);

  const toggleBottomSheet = (mood: Mood | null = null) => {
    setSelectedMood(mood);
    setIsBottomSheet((prev) => !prev);
  };

  // 초기 카테고리 목록 및 무드 가져오기기
  useEffect(() => {
    const fetchCategoriesAndMoods = async () => {
      if (!userId) return;

      try {
        const categoryCollectionRef = collection(db, "user", userId, "mood");
        const querySnapshot = await getDocs(categoryCollectionRef);

        if (querySnapshot.empty) {
          console.log("해당 카테고리 문서가 존재하지 않음");
        } else {
          const categories = querySnapshot.docs.map((doc) => doc.data().name);
          setCategoryList(categories);

          // 각 카테고리의 documents 컬렉션에서 무드 데이터 가져오기
          let allMoods: any[] = [];
          for (const categoryId of categories) {
            const documentsCollectionRef = collection(
              db,
              "user",
              userId,
              "mood",
              categoryId,
              "documents"
            );
            const documentsSnapshot = await getDocs(documentsCollectionRef);
            const moodsData = documentsSnapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate().toISOString(),
                category: categoryId,
                currentImageIndex: 0,
              };
            });
            allMoods = [...allMoods, ...moodsData];
          }
          allMoods.sort((a, b) => b.createdAt - a.createdAt);
          dispatch(setMoods(allMoods));
        }
      } catch (e) {
        console.error("카테고리 로드 중 오류 발생", e);
      }
    };
    fetchCategoriesAndMoods();
  }, [userId, dispatch]);

  // 카테고리가 변경될 때 무드 필터링
  useEffect(() => {
    if (category) {
      const filtered = moods.filter((mood) => mood.category === category);
      setFilteredMoods(filtered);
    } else {
      setFilteredMoods(moods);
    }
  }, [category, moods]);

  // 화면 바깥 클릭 감지
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        categoryListRef.current &&
        !categoryListRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // 카테고리 선택 시
  const handleCategorySelect = (selectedCategory: string) => {
    setCategory(selectedCategory);
    setIsFocused(false);
  };

  // 이미지 인덱스 변경
  const handleImageIndexChange = (moodIndex: number, newIndex: number) => {
    setFilteredMoods((prev) =>
      prev.map((mood, index) =>
        index === moodIndex ? { ...mood, currentImageIndex: newIndex } : mood
      )
    );

    // console.log(filteredMoods, "filteredMoods Home");
  };

  return (
    <>
      {isBottomSheet && (
        <BottomSheet
          text="삭제, 수정"
          toggleBottomSheet={toggleBottomSheet || (() => {})}
          selectedMood={selectedMood}
        />
      )}
      <Header main />
      <MainStyle>
        <CategoryContainer>
          {moods.length > 0 ? (
            <CategoryStyle $isFocused={isFocused}>
              <CategoryInput
                type="text"
                placeholder="전체"
                value={category}
                readOnly
                onFocus={() => {
                  setCategory("");
                  setIsFocused(true);
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setIsFocused(!isFocused);
                }}
              >
                <img src={iconDropdown} alt="화살표 버튼" />
              </button>
            </CategoryStyle>
          ) : (
            ""
          )}

          {isFocused && (
            <CategoryLists
              ref={categoryListRef}
              onMouseDown={(e) => e.preventDefault()}
            >
              {categoryList.length === 0 ? (
                <EmptyMessage>카테고리를 추가하세요.</EmptyMessage>
              ) : (
                categoryList.map((category, index) => (
                  <li
                    key={index}
                    onClick={() => handleCategorySelect(category)}
                  >
                    {category}
                  </li>
                ))
              )}
            </CategoryLists>
          )}
        </CategoryContainer>
        <MyMoodStyle>
          <MoodList>
            {moods.length > 0 ? (
              filteredMoods.map((mood, index) => {
                const date =
                  typeof mood.createdAt?.toDate === "function"
                    ? mood.createdAt.toDate()
                    : new Date(mood.createdAt);
                const formattedDate = date.toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
                return (
                  <li key={index}>
                    <button
                      type="button"
                      onClick={() => {
                        toggleBottomSheet(mood);
                      }}
                    >
                      <img src={iconSMoreVertical} alt="바텀시트 열기 버튼" />
                    </button>
                    <span>{mood.textAreaValue}</span>
                    {mood.fileURLs.length > 0 && (
                      <div>
                        <ImageSliderStyle>
                          {mood.fileURLs.length > 1 &&
                            mood.currentImageIndex !== 0 && (
                              <button
                                onClick={() =>
                                  handleImageIndexChange(
                                    index,
                                    mood.currentImageIndex === 0
                                      ? mood.fileURLs.length - 1
                                      : mood.currentImageIndex - 1
                                  )
                                }
                                type="button"
                              >
                                <img src={iconLeftSlide} alt="" />
                              </button>
                            )}
                          <div className="image-container">
                            <img
                              src={mood.fileURLs[mood.currentImageIndex]}
                              alt="무드 이미지"
                            />
                          </div>

                          {mood.fileURLs.length > 1 &&
                            mood.currentImageIndex >= 0 &&
                            mood.currentImageIndex !==
                              mood.fileURLs.length - 1 && (
                              <button
                                onClick={() =>
                                  handleImageIndexChange(
                                    index,
                                    mood.currentImageIndex ===
                                      mood.fileURLs.length - 1
                                      ? 0
                                      : mood.currentImageIndex + 1
                                  )
                                }
                                type="button"
                              >
                                <img src={iconRightSlide} alt="" />
                              </button>
                            )}
                        </ImageSliderStyle>
                      </div>
                    )}
                    <p>
                      <span>{formattedDate}</span>
                    </p>
                    <BtnDotStyle>
                      {mood.fileURLs.length > 1 &&
                        mood.fileURLs.map((url: string, dotIndex: number) => (
                          <button
                            key={dotIndex}
                            type="button"
                            className={
                              mood.currentImageIndex === dotIndex
                                ? "active"
                                : ""
                            }
                          ></button>
                        ))}
                    </BtnDotStyle>
                  </li>
                );
              })
            ) : (
              <EmptyMoodContainer>
                <img src={symbolLogoGray} alt="" />
                <p>mood를 등록해보세요!</p>
                <button
                  type="button"
                  onClick={() => {
                    navigate("/setmood");
                  }}
                >
                  mood 등록
                </button>
              </EmptyMoodContainer>
            )}
          </MoodList>
        </MyMoodStyle>
      </MainStyle>
    </>
  );
}

export const MainStyle = styled.main`
  height: calc(100% - 60px);
  overflow-x: hidden;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const CategoryContainer = styled.div`
  padding: 19px 21px 0 21px;
  position: relative;
`;

export const BtnDotStyle = styled.div`
  position: absolute;
  left: 50%;
  transform: translate(-50%, 315px);
  button {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-bg);
    padding: 0;
    margin-right: 5px;

    &.active {
      background: var(--color-main);
    }
  }
`;

export const ImageSliderStyle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  .image-container {
    width: 336px;
    height: 252px;
    border: 1px solid var(--color-disabled);
    border-radius: 10px;
    overflow: hidden;
    transition: transform 0.5s ease-in-out;
    > img {
      width: 100%;
      height: 100%;
    }
  }

  button {
    border: none;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }

  button:first-child {
    left: 10px;
  }

  button:last-child {
    right: 10px;
  }
`;

export const EmptyMoodContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  transform: translateY(-15%);
  justify-content: center;
  font-size: 14px;

  img {
    max-width: 100px;
    margin: 0 auto;
  }

  p {
    color: #767676;
    padding: 13px 0 29px 0;
  }

  button {
    color: var(--color-dark);
    background: var(--color-main);
    width: 120px;
    height: 44px;
    border-radius: 20px;
    margin: 0 auto;
  }
`;
