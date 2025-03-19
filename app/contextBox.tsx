'use client';
import React, { useRef } from 'react';

import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Textarea } from "@nextui-org/input";
import { Citation } from './types';

export interface ContextBoxProps {
    onTextChange?: (val: string) => void;
    className?: string;
    loading?: boolean;
    editView?: boolean;
    citations?: Citation[];
    visibleCitationId?: string;
    templateText?: string;
}

export function ContextBox(props: ContextBoxProps) {
    const [value, setValue] = React.useState("");
    const selectedCitationRef = useRef<HTMLSpanElement>(null);
    React.useEffect(() => {
        if (props.visibleCitationId && selectedCitationRef.current) {
            selectedCitationRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [props.visibleCitationId]);

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

    const renderEditView = (props: ContextBoxProps): React.ReactNode => {
        return (
            <Textarea
                classNames={{
                    inputWrapper: '!h-[559px]',
                    input: '!h-[539px]',
                }}
                disableAutosize={true}
                size="lg"
                minRows={10}
                label="Context"
                labelPlacement="outside"
                placeholder="Add context for the provided claims"
                value={value}
                variant="underlined"
                onValueChange={propagateTextChange}
            />
        );
    };

    const renderClaimView = (props: ContextBoxProps): React.ReactNode => {
        const citations = props.citations || [];
        const sortedCitations = citations.sort((a, b) => a.startOffset - b.startOffset);
        const citationSpans: React.ReactNode[] = sortedCitations.map((citation: Citation, ind: number) => {
            const isSelectedCitation = citation.id === props.visibleCitationId;
            return (
                <span key={ind}>
                    {isSelectedCitation ? <span key={ind.toString() + "selected"} ref={selectedCitationRef} /> : null}
                    <mark className="bg-yellow-200 mark-rounded">
                        {value.slice(citation.startOffset, citation.endOffset)}<sup>{citation.id}</sup>
                    </mark>
                </span>
            );
        });
        let startIndex = 0;
        let currentInd = 0;
        let currentKey = citations.length;
        const allSpans: React.ReactNode[] = [];
        while (currentInd < value.length) {
            const nextCitation = sortedCitations.findIndex((citation) => citation.startOffset === currentInd);
            if (nextCitation >= 0) {
                // Push our current text before the citation starts.
                if (startIndex < currentInd) {
                    allSpans.push(
                        <span key={currentKey}>
                            {value.slice(startIndex, currentInd)}
                        </span>
                    );
                    currentKey++;
                }
                allSpans.push(citationSpans[nextCitation]);
                currentInd = sortedCitations[nextCitation].endOffset;
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

    const renderHeader = (props: ContextBoxProps): React.ReactNode => {
        if (props.editView) {
            return null;
        }
        return (
            <CardHeader>
                Context
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