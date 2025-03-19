'use client';
import React from 'react';

import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Textarea } from "@nextui-org/input";
import { getSupportedBgColor } from './colors';
import { Claim } from './types';
export interface ClaimBoxProps {
    className?: string;
    onTextChange?: (val: string) => void;
    onClaimClick?: (ind: number) => void;
    selectedClaim: number;
    loading?: boolean;
    editView?: boolean;
    claims?: Claim[];
    templateText?: string;
}

export function ClaimBox(props: ClaimBoxProps) {
    const [value, setValue] = React.useState("");

    const propagateTextChange = (val: string) => {
        setValue(val);
        if (props.onTextChange) {
            props.onTextChange(val);
        }
    };

    React.useEffect(() => {
        if (props.templateText !== undefined) {
            propagateTextChange(props.templateText);
        }
    }, [props.templateText]);

    const propagateClaimClick = (ind: number) => {
        if (props.onClaimClick) {
            props.onClaimClick(ind);
        }
    };

    const renderEditView = (props: ClaimBoxProps): React.ReactNode => {
        return (
            <Textarea
                size="lg"
                minRows={5}
                label="Claims to verify"
                labelPlacement="outside"
                placeholder="Text to verify"
                value={value}
                variant="underlined"
                onValueChange={propagateTextChange}
            />
        );
    };

    const renderClaimView = (props: ClaimBoxProps): React.ReactNode => {
        const claims = props.claims || [];
        const sortedClaims = claims.sort((a, b) => a.startOffset - b.startOffset);
        const claimSpans: React.ReactNode[] = sortedClaims.map((claim: Claim, ind: number) => {
            const claimValue = value.slice(claim.startOffset, claim.endOffset);
            const trimmedClaim = claimValue.trim();
            const trimStart = claimValue.indexOf(trimmedClaim);
            const trimEnd = trimStart + trimmedClaim.length;
            const leadingWhitespace = claimValue.slice(0, trimStart);
            const trailingWhitespace = claimValue.slice(trimEnd);
            const color = getSupportedBgColor(claim.score);
            const underlineClass = ind === props.selectedClaim ? "underline" : "";
            return (
                <span key={ind} onClick={() => propagateClaimClick(ind)}>
                    {leadingWhitespace}
                    <mark className={color + " mark-rounded cursor-pointer hover:underline " + underlineClass}>
                        {trimmedClaim}
                    </mark>
                    {trailingWhitespace}
                </span>
            );
        });
        let startIndex = 0;
        let currentInd = 0;
        let currentKey = sortedClaims.length;
        const allSpans: React.ReactNode[] = [];
        while (currentInd < value.length) {
            const nextClaim = sortedClaims.findIndex((claim) => claim.startOffset === currentInd);
            if (nextClaim >= 0) {
                // Push our current text before the claim starts.
                if (startIndex < currentInd) {
                    allSpans.push(
                        <span key={currentKey}>
                            {value.slice(startIndex, currentInd)}
                        </span>
                    );
                    currentKey++;
                }
                allSpans.push(claimSpans[nextClaim]);
                currentInd = sortedClaims[nextClaim].endOffset;
                startIndex = currentInd;
            } else {
                currentInd++;
            }
        }
        // Push the remaining text.
        if (startIndex < currentInd) {
            allSpans.push(
                <span key={currentKey}>
                    {value.slice(startIndex, currentInd)}
                </span>
            );
        }
        return (
            <div>
                {allSpans}
            </div>
        );
    };

    const renderHeader = (props: ClaimBoxProps): React.ReactNode => {
        if (props.editView) {
            return null;
        }
        return (
            <CardHeader>
                Claims to verify
            </CardHeader>
        );
    };

    return (
        <Card className={props.className || "max-w-[400px]"}>
            {renderHeader(props)}
            <CardBody>
                {props.editView ? renderEditView(props) : renderClaimView(props)}
            </CardBody>
        </Card>
    )
}