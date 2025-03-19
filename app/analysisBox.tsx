'use client';
import React from 'react';

import { faCheck, faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Selection } from '@react-types/shared';
import { getSupportedTextColor } from './colors';
import { Claim } from './types';

export interface AnalysisBoxProps {
    className?: string;
    onClaimClick?: (ind: number) => void;
    onCitationClick?: (citationId: string) => void;
    selectedClaim: number;
    claimText: string;
    loading?: boolean;
    editView?: boolean;
    claims?: Claim[];
}

function getIcon(score: number): React.ReactNode {
    return (
        <FontAwesomeIcon icon={score >= 0.5 ? faCheck : faX} />
    );
}


export function AnalysisBox(props: AnalysisBoxProps) {
    const selectedKeys = props.selectedClaim > -1 ? new Set<string>([props.selectedClaim.toString()]) : new Set<string>([]);
    const propagateClaimClick = (selection: Selection) => {
        // Start with an empty set for the scenario when nothing is selected.
        const selectedKey = new Set<string>([]);
        if (selection === 'all') {
            // Add only the first key, if it exists.
            if (props.claims && props.claims.length > 0) {
                selectedKey.add("0");
            } else {
                if (props.onClaimClick) {
                    // Indicate no selection.
                    props.onClaimClick(-1);
                }
            }
        } else if (selection.size > 0) {
            const firstKey = selection.values().next().value!;
            selectedKey.add(firstKey.toString());
            if (props.onClaimClick) {
                props.onClaimClick(parseInt(firstKey.toString()));
            }
        } else {
            if (props.onClaimClick) {
                // Indicate no selection.
                props.onClaimClick(-1);
            }
        }
    };

    const propagateCitationClick = (citationId: string) => {
        if (props.onCitationClick) {
            props.onCitationClick(citationId);
        }
    };


    const renderCitations = (claim: Claim): React.ReactNode => {
        if (claim.citationIds.length === 0) {
            return (
                <div className="pt-2">None</div>
            );
        }
        const renderedCitations = claim.citationIds.map((citationId) => {
            return (
                <div key={citationId}>
                    <button
                        className="underline text-blue-500 hover:text-blue-700"
                        onClick={() => propagateCitationClick(citationId)}>
                        Line {citationId}
                    </button>
                </div>
            );
        });
        return (
            <div className="pt-2">
                {renderedCitations}
            </div>
        );
    }


    const renderClaimView = (props: AnalysisBoxProps): React.ReactNode => {
        const claims = props.claims || [];
        const drawers = claims.map((claim: Claim, ind: number) => {
            const userClaimNumber = (ind + 1).toString();
            const maxChars = 30;
            const endOffset = Math.min(claim.endOffset, claim.startOffset + maxChars);
            const suffix = claim.endOffset > endOffset ? "..." : "";
            const snippet = props.claimText.slice(claim.startOffset, endOffset).trim() + suffix;
            const supportedScore = claim.score;
            const unsupportedScore = Math.max(0, 1 - claim.score);
            const supportedColor = getSupportedTextColor(Math.max(supportedScore, unsupportedScore));
            const unsupportedColor = getSupportedTextColor(Math.min(supportedScore, unsupportedScore));
            return (
                <AccordionItem key={ind} title={`Claim ${userClaimNumber} — (${snippet})`} className="overflow-hidden">
                    <ul className="border rounded-md p-2">
                        <li className="border-b py-2">
                            Supported:
                            {supportedScore > unsupportedScore ? (<span className={supportedColor}>
                                &nbsp;<FontAwesomeIcon icon={faCheck} />
                            </span>) : (
                            <span className={unsupportedColor}>
                                &nbsp;<FontAwesomeIcon icon={faX} />
                            </span>)}
                        </li>
                        <li className="border-b py-2">
                            Rationale:
                            <div className="pt-2">
                                {claim.rationale}
                            </div>
                        </li>
                        <li className="py-2">
                            Citations:
                            {renderCitations(claim)}
                        </li>
                    </ul>
                </AccordionItem>
            );
        });
        return (
            <Accordion
                selectionMode="single"
                selectedKeys={selectedKeys}
                onSelectionChange={propagateClaimClick}>
                {drawers}
            </Accordion>
        );
    };

    const renderLoadingView = (): React.ReactNode => {
        return (
            <div role="status" className="max-w-sm animate-pulse">
                <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[330px] mb-2.5"></div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[300px] mb-2.5"></div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
                <span className="sr-only">Loading...</span>
            </div>
        );
    }

    return (
        <Card className={props.className || "max-w-[400px]"}>
            <CardHeader>
                Explanations
            </CardHeader>
            <CardBody>
                {props.loading ? renderLoadingView() : null}
                {props.editView ? null : renderClaimView(props)}
            </CardBody>
        </Card>
    )
}