'use client';

import { ColoredSection } from "@/components/coloredSection";
import { SpinButton } from "@/components/spinButton";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/popover";
import { Select, SelectItem } from "@nextui-org/select";
import React, { useState } from 'react';
import { AnalysisBox } from './analysisBox';
import { ClaimBox } from './claimBox';
import { ContextBox } from './contextBox';
import { Citation, Claim, VerifyClaimRequest, VerifyClaimResponse } from './types';

export interface ExampleTemplates {
  displayName: string;
  claim: string;
  context: string;
}

export interface Model {
  name: string;
  displayName: string;
  apiUrl: string;
  apiKey: string | undefined;
  isEmbeddingModel: boolean | undefined;
}

export interface ClaimVerifierProps {
  models: Model[];
  examples: ExampleTemplates[];
}

export default function ClaimVerifier(props: ClaimVerifierProps) {
  const [targetModel, setTargetModel] = useState<string>('');
  const [claimResponse, setClaimResponse] = useState<VerifyClaimResponse | null>(null);
  const [claimInput, setClaimInput] = useState('');
  const [claimContext, setClaimContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [editView, setEditView] = useState(true);
  const [selectedClaimInd, setSelectedClaimInd] = useState<number>(-1);
  const [visibleCitations, setVisibleCitations] = useState<Citation[]>([]);
  const [selectedCitationId, setSelectedCitationId] = useState<string | undefined>(undefined);
  const [showErrorMessage, setShowErrorMessage] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ExampleTemplates | undefined>(undefined);

  const resetState = () => {
    setClaimResponse(null);
    setSelectedClaimInd(-1)
    setVisibleCitations([]);
    setSelectedCitationId(undefined);
    setShowErrorMessage(false);
  }

  const onModelSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setTargetModel(value);
  };

  const onExampleTemplateSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const selectedTemplate = props.examples.find((example) => example.displayName === value);
    if (selectedTemplate !== undefined) {
      setSelectedTemplate(selectedTemplate);
    }
  };

  const updateSelectedClaim = (claimIndex: number) => {
    if (!claimResponse) {
      return;
    }
    setSelectedClaimInd(claimIndex);
    setSelectedCitationId(undefined);
    if (claimIndex < 0) {
      setVisibleCitations([]);
    }
    else {
      setVisibleCitations(claimResponse?.claims[claimIndex].citationIds.map((citationId) => claimResponse?.citations[citationId]) || []);
    }
  }

  const verifyClaims = (input: string, context: string) => {
    const apiEndpoint = 'https://api.oumi.ai/verifyClaims';
    const data: VerifyClaimRequest = {
      model: targetModel,
      input: input,
      context: context,
    };
    setLoading(true);
    resetState();
    fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'Authorization': 'BEARER bd5784a355bbfd9146c555a70f00accb'
      },
      body: JSON.stringify(data),
    })
      .then((res) => {
        return res.json().then((jsonData) => {
          const parsedResponse: VerifyClaimResponse = {
            claims: [],
            citations: {}
          };
          jsonData.claims.forEach((claim: any) => {
            const newClaim: Claim = {
              startOffset: claim.start_offset,
              endOffset: claim.end_offset,
              citationIds: claim.citation_ids,
              score: claim.score,
              rationale: claim.rationale
            };
            parsedResponse.claims.push(newClaim);
          });
          jsonData.citations.forEach((citation: any) => {
            const newCitation: Citation = {
              startOffset: citation.start_offset,
              endOffset: citation.end_offset,
              id: citation.id
            };
            parsedResponse.citations[citation.id] = newCitation;
          });
          setClaimResponse(parsedResponse);
          setLoading(false);
          setEditView(false);
          return parsedResponse;
        })
      }).catch((err) => {
        setLoading(false);
        setShowErrorMessage(true);
      });
  };

  return (
    <ColoredSection
      colorClass="bg-white"
    >
      <div className="grid grid-cols-[repeat(auto-fit,400px)] justify-center container gap-3 font-inria">
        <div className="column-start-1 col-span-1 xl:col-span-2">
          <Popover
            isOpen={showErrorMessage}
            onClose={() => setShowErrorMessage(false)}
            placement="right"
            showArrow={true}
            backdrop="opaque"
          >
            <PopoverTrigger>
              <div className="inline-block">
                <SpinButton
                  className="justify-self-start"
                  onClick={() => editView ? verifyClaims(claimInput, claimContext) : setEditView(true)}
                  text={editView ? "Verify claims" : "Try another claim"}
                  inProgress={loading}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent>
              <div className="p-2 bg-red-500 text-white rounded-md">
                Whoops, that&apos;s an error! Please try again.
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className=" lg:justify-items-end">
          <div className="flex">
            <Select
              className="w-[200px]"
              label="Choose a model"
              isDisabled={!editView || loading}
              defaultSelectedKeys={props.models.length > 0 ? [props.models[0].name] : []}
              onChange={onModelSelection}
              disallowEmptySelection={true}
            >
              {props.models.map((model) => (
                <SelectItem key={model.name}>{model.displayName}</SelectItem>
              ))}
            </Select>
            <Select
              className="w-[250px]"
              label="Try an example"
              isDisabled={!editView || loading}
              defaultSelectedKeys={props.examples.length > 0 ? [props.examples[0].displayName] : []}
              onChange={onExampleTemplateSelection}
              disallowEmptySelection={true}
            >
              {props.examples.map((example) => (
                <SelectItem key={example.displayName}>{example.displayName}</SelectItem>
              ))}
            </Select>
          </div>
        </div>
        <div className="column-start-1 lg:col-span-2 lg:row-start-2 lg:row-span-3">
          <ContextBox
            className="w-full h-[625px]"
            onTextChange={setClaimContext}
            loading={loading}
            citations={visibleCitations}
            editView={editView}
            visibleCitationId={selectedCitationId}
            templateText={selectedTemplate ? selectedTemplate.context : undefined}
          />
        </div>
        <div>
          <ClaimBox
            className="w-[400px] h-[200px]"
            onTextChange={setClaimInput}
            onClaimClick={updateSelectedClaim}
            selectedClaim={selectedClaimInd}
            loading={loading}
            claims={claimResponse ? claimResponse.claims : []}
            editView={editView}
            templateText={selectedTemplate ? selectedTemplate.claim : undefined}
          />
        </div>
        <div>
          <AnalysisBox
            className="w-[400px] h-[413px]"
            loading={loading}
            claimText={claimInput}
            selectedClaim={selectedClaimInd}
            onClaimClick={updateSelectedClaim}
            onCitationClick={setSelectedCitationId}
            claims={claimResponse ? claimResponse.claims : []}
            editView={editView}
          />
        </div>
      </div>
    </ColoredSection>
  )
}
