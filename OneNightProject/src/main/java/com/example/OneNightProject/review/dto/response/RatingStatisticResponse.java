package com.example.OneNightProject.review.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class RatingStatisticResponse {

    private Long oneStar;

    private Long twoStar;

    private Long threeStar;

    private Long fourStar;

    private Long fiveStar;
}
