import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import styled from "styled-components";
import IconSearch from "../assets/images/icon-search-light.svg";
import IconDate from "../assets/images/icon-date.svg";
import axios from "axios";
import ScheduleModal from "../components/ScheduleModal";

export interface ScheduleData {
	mt20id: string[];
	prfnm: string[];
	prfpdfrom: string[];
	prfpdto: string[];
	fcltynm: string[];
	poster: string[];
	area: string[];
	genrenm: string[];
	openrun: string[];
	prfstate: string[];
}

const SetSchedule: React.FC = () => {
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [todayDate, setTodayDate] = useState<string>("");
	const [scheduleData, setScheduleData] = useState<ScheduleData[]>([]);
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [apiUrl, setApiUrl] = useState<string>("");
	const [selectedSchedule, setSelectedSchedule] = useState<ScheduleData | null>(
		null
	);

	useEffect(() => {
		const date = new Date();
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		setTodayDate(`${year}${month}${day}`);
	}, []);

	const handleSearch = () => {
		const url = `http://localhost:5000/api/kopis?shprfnm=${encodeURIComponent(
			searchQuery
		)}`;

		axios
			.get<ScheduleData[]>(url)
			.then((result) => {
				console.log("API 응답 데이터:", result.data);
				setScheduleData(result.data);
				setApiUrl(url);
				setIsModalOpen(true);
			})
			.catch((error) => {
				console.error("데이터 가져오기 오류:", error);
			});
	};

	const closeModal = () => {
		setIsModalOpen(false);
	};

	const handleSelectSchedule = (schedule: ScheduleData) => {
		setSelectedSchedule(schedule);
		setIsModalOpen(false);
	};

	return (
		<>
			<Header set />
			<SetScheduleContainer>
				<Section>
					<Label htmlFor="name">관람명</Label>
					<Input
						type="text"
						id="name"
						placeholder="관람명을 검색해주세요."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
					<BtnSearch onClick={handleSearch}>
						<img src={IconSearch} alt="검색" />
					</BtnSearch>
				</Section>
				<Section>
					<Label htmlFor="image">이미지</Label>
					<Image
						style={{
							backgroundImage: selectedSchedule
								? `url(${selectedSchedule.poster[0]})`
								: "none",
						}}
					></Image>
				</Section>
				<Section>
					<Label htmlFor="location">장소</Label>
					{/* <Input type="text" id="location" placeholder="장소를 입력해주세요." /> */}
					<Input
						type="text"
						id="location"
						placeholder="장소를 입력해주세요."
						value={selectedSchedule?.fcltynm[0] || ""}
						readOnly
					/>
				</Section>
				<Section>
					<Label htmlFor="date">관람날짜</Label>
					{/* <Input type="text" id="date" placeholder="관람날짜를 선택해주세요." /> */}
					<Input
						type="text"
						id="date"
						placeholder="관람날짜를 선택해주세요."
						value={
							selectedSchedule
								? `${selectedSchedule.prfpdfrom[0]} ~ ${selectedSchedule.prfpdto[0]}`
								: ""
						}
						readOnly
					/>
					<BtnDate>
						<img src={IconDate} alt="날짜 선택" />
					</BtnDate>
				</Section>
				<Section>
					<Label htmlFor="time">관람시간</Label>
					<Input type="text" id="time" placeholder="관람시간을 입력해주세요." />
				</Section>
				<Section>
					<Label htmlFor="cast">출연진</Label>
					<Input type="text" id="cast" placeholder="출연진을 입력해주세요." />
				</Section>
			</SetScheduleContainer>
			<SetScheduleContainer>
				{/* 선택된 공연 정보 표시 */}
				{selectedSchedule && (
					<div>
						<h3>{selectedSchedule.prfnm[0]}</h3>
						<p>{selectedSchedule.fcltynm[0]}</p>
						<p>
							{selectedSchedule.prfpdfrom[0]} ~ {selectedSchedule.prfpdto[0]}
						</p>
					</div>
				)}
				{/* ... 나머지 코드 */}
			</SetScheduleContainer>
			{isModalOpen && (
				<ScheduleModal
					onClose={closeModal}
					scheduleData={scheduleData}
					apiUrl={apiUrl}
					onSelect={handleSelectSchedule}
				/>
			)}
		</>
	);
};

const SetScheduleContainer = styled.div`
	display: flex;
	height: calc(100vh - 108px);
	overflow-y: auto;
	padding: 20px 39px 0 29px;
	font-size: 14px;
	flex-direction: column;
`;

const Section = styled.div`
	display: flex;
	width: 100%;
	margin-bottom: 19px;
	align-items: flex-start;
	position: relative;
`;

const Label = styled.label`
	width: 70px;
	display: flex;
	align-items: center;
`;

const Input = styled.input`
	border: none;
	border-bottom: 1px solid var(--color-disabled);
	width: 250px;
	padding: 0 0 5px 0;
	font-size: 14px;
`;

const BtnSearch = styled.button`
	background: none;
	border: none;
	top: -1px;
	left: 300px;
	cursor: pointer;
	position: absolute;
	z-index: 2;
	width: 16px;
	height: 16px;

	img {
		width: 16px;
		height: 16px;
	}
`;

const BtnDate = styled.button`
	background: none;
	border: none;
	top: -1px;
	left: 300px;
	cursor: pointer;
	position: absolute;
	z-index: 2;
	width: 15px;
	height: 17px;

	img {
		width: 15px;
		height: 17px;
	}
`;

const Image = styled.div`
	width: 250px;
	height: 360px;
	background-color: #f2f2f2;
	border-radius: 10px;
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
`;

export default SetSchedule;
